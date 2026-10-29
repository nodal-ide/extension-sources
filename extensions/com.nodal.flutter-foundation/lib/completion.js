'use strict';

// Completion contexts, ranked and capped. The host filters the returned snapshot instantly and
// re-requests after a short debounce, so every list is ordered by usefulness, not alphabetically.

const catalog = require('./catalog');
const text = require('./text');
const { resolveReceiver, resolveCallable } = require('./resolve');

const MAX_ITEMS = 200;

const KIND_MAP = {
  widget: 'widget',
  class: 'class',
  mixin: 'class',
  enum: 'enum',
  typedef: 'type',
  function: 'function',
  constructor: 'constructor'
};

// Candidate sets are built once and reused; entries are never mutated after construction.
const sets = new Map();

function makeSet(builder) {
  const items = builder();
  return { items, lowers: items.map(item => item.label.toLowerCase()) };
}

/** Copies entries in final order, stamping `sortText` so equal host scores keep provider order. */
function finalize(items) {
  return items.map((entry, index) => ({ ...entry, sortText: String(index).padStart(4, '0') }));
}

function candidateSet(key, builder) {
  let set = sets.get(key);
  if (!set) {
    set = makeSet(builder);
    sets.set(key, set);
  }
  return set;
}

function item(label, kind, detail, doc, insertText, snippet) {
  const entry = { label };
  if (detail) entry.detail = detail;
  if (doc) entry.documentation = doc;
  if (kind) entry.kind = kind;
  entry.insertText = insertText === undefined ? label : insertText;
  if (snippet) entry.snippet = true;
  return entry;
}

function matchScore(lower, needle) {
  if (lower.startsWith(needle)) return 1000 - lower.length;
  const index = lower.indexOf(needle);
  if (index >= 0) {
    const boundary = /[_./$]/.test(lower[index - 1] || '');
    return (boundary ? 780 : 620) - index * 2 - lower.length;
  }
  let matched = 0;
  for (let i = 0; i < lower.length && matched < needle.length; i++) {
    if (lower[i] === needle[matched]) matched++;
  }
  return matched === needle.length ? 340 - lower.length : 0;
}

function ranked(set, prefix) {
  if (!prefix) return finalize(set.items.slice(0, MAX_ITEMS));
  const needle = prefix.toLowerCase();
  const scored = [];
  for (let i = 0; i < set.items.length; i++) {
    const score = matchScore(set.lowers[i], needle) - (set.items[i].kind === 'keyword' ? 25 : 0);
    if (score > 0) scored.push([score, i]);
  }
  scored.sort((a, b) => b[0] - a[0] || a[1] - b[1]);
  return finalize(scored.slice(0, MAX_ITEMS).map(entry => set.items[entry[1]]));
}

// MARK: - Candidate builders

function frameworkItem(entry) {
  const kind = KIND_MAP[entry.kind] || 'class';
  const constructible = entry.constructible && (entry.kind !== 'function');
  return item(
    entry.name,
    kind,
    entry.kind === 'typedef' ? 'typedef' : entry.kind,
    entry.doc,
    constructible ? `${entry.name}($1)` : entry.name,
    constructible
  );
}

function defaultSet() {
  return candidateSet('default', () => {
    const items = [];
    for (const entry of catalog.framework.values()) items.push(frameworkItem(entry));
    for (const [name, entry] of catalog.coreTypes) {
      items.push(item(name, 'type', 'type', entry.doc, name));
    }
    for (const [name, entry] of catalog.coreFunctions) {
      items.push(item(name, 'function', 'function', entry.doc, `${name}($1)`, true));
    }
    for (const keyword of catalog.keywords) {
      items.push(item(keyword, 'keyword', 'keyword', 'Dart keyword.', keyword));
    }
    return items;
  });
}

function valueSet() {
  return candidateSet('value', () => {
    const items = [];
    for (const entry of catalog.framework.values()) items.push(frameworkItem(entry));
    for (const [name, entry] of catalog.coreTypes) {
      items.push(item(name, 'type', 'type', entry.doc, name));
    }
    for (const [name, entry] of catalog.coreFunctions) {
      items.push(item(name, 'function', 'function', entry.doc, `${name}($1)`, true));
    }
    for (const literal of ['true', 'false', 'null', 'const']) {
      items.push(item(literal, 'keyword', 'keyword', 'Dart literal.', literal));
    }
    return items;
  });
}

function memberRow([name, signature, doc]) {
  const callable = signature.includes('(');
  return item(
    name,
    callable ? 'method' : 'property',
    callable ? undefined : 'property',
    doc,
    callable ? `${name}($1)` : name,
    callable
  );
}

const isStatic = member => /^static\b/.test(member[1]);

/** Members for a receiver. A bare type name also offers its statics, statics first. */
function memberItems(type, bare) {
  const instance = catalog.typeMembers.get(type);
  const statics = bare ? catalog.staticMembers.get(type) : null;
  const constructors = bare ? catalog.namedConstructors.get(type) : null;
  if (!instance && !statics && !constructors) return null;
  return candidateSet(`members:${type}:${bare ? 'static' : 'instance'}`, () => {
    const rows = [];
    const seen = new Set();
    const add = member => {
      if (seen.has(member[0])) return;
      seen.add(member[0]);
      rows.push(memberRow(member));
    };
    const members = (instance || []).filter(([name]) => !name.startsWith('operator '));
    if (bare) {
      const constructors = constructorItems(type);
      if (constructors) constructors.items.forEach(entry => {
        if (seen.has(entry.label)) return;
        seen.add(entry.label);
        rows.push(entry);
      });
      if (statics) statics.forEach(add);
      members.filter(isStatic).forEach(add);
    }
    members.filter(member => !isStatic(member)).forEach(add);
    return rows;
  });
}

function constructorItems(type) {
  const entries = catalog.namedConstructors.get(type);
  if (!entries) return null;
  return candidateSet(`constructors:${type}`, () =>
    entries.map(entry => {
      const name = entry.name.slice(entry.name.indexOf('.') + 1);
      return item(name, 'constructor', 'constructor', entry.doc, `${name}($1)`, true);
    })
  );
}

function enumItems(type) {
  const values = catalog.enumValues.get(type);
  if (!values) return null;
  return candidateSet(`enum:${type}`, () =>
    values.map(value => item(value, 'enumcase', type))
  );
}

function iconItems() {
  return candidateSet('icons', () =>
    catalog.iconsList.map(name => item(name, 'constant', 'IconData', 'Material icon constant.'))
  );
}

function colorItems() {
  return candidateSet('colors', () =>
    catalog.colors.map(name => item(name, 'constant', 'Color', catalog.colorDocs.get(name) || 'Material color.'))
  );
}

function colorMemberItems() {
  return candidateSet('colorMembers', () => {
    const items = [];
    for (const [name, signature, doc] of catalog.colorMembers.values()) {
      const callable = signature.includes('(');
      items.push(item(name, callable ? 'method' : 'property', undefined, doc, callable ? `${name}($1)` : name, callable));
    }
    for (let shade = 50; shade <= 900; shade += shade < 100 ? 50 : 100) {
      items.push(item(`shade${shade}`, 'constant', 'Color'));
    }
    return items;
  });
}

function genericItems() {
  return candidateSet('generic', () => {
    const items = [];
    for (const [name, signature, doc] of catalog.genericMembers) {
      const callable = signature.includes('(');
      items.push(item(name, callable ? 'method' : 'property', undefined, doc, callable ? `${name}($1)` : name, callable));
    }
    for (const [name, signature, doc] of catalog.widgetMembers.values()) {
      const callable = signature.includes('(');
      items.push(item(name, callable ? 'method' : 'property', undefined, doc, callable ? `${name}($1)` : name, callable));
    }
    return items;
  });
}

function annotationItems() {
  return candidateSet('annotations', () =>
    Array.from(catalog.annotations.values(), entry =>
      item(entry.name, 'constant', `@${entry.name}`, entry.doc)
    )
  );
}

function moduleItems() {
  return candidateSet('modules', () =>
    catalog.modules.map(([path, doc]) => item(path, 'module', 'package', doc, path))
  );
}

const TYPE_ALIASES = {
  EdgeInsetsGeometry: 'EdgeInsets',
  BorderRadiusGeometry: 'BorderRadius',
  Decoration: 'BoxDecoration',
  ShapeBorder: 'RoundedRectangleBorder',
  ColorValue: 'Color'
};

/** Constructors that fit a parameter's type, e.g. `padding:` → EdgeInsets constructors. */
function specificValueItems(type) {
  if (!type) return null;
  const token = type.replace(/[?*]/g, '').replace(/<.*$/, '').trim();
  if (!token || token === 'Widget') return null;
  const target = TYPE_ALIASES[token] || token;
  const names = [];
  for (const name of catalog.framework.keys()) {
    if (name === target || name.startsWith(`${target}.`)) names.push(name);
  }
  if (!names.length) return null;
  return candidateSet(`value:${target}`, () =>
    names.map(name => frameworkItem(catalog.framework.get(name)))
  );
}

function parameterItems(target, used) {
  const params = target.params.filter(param => !param.positional && !used.has(param.name));
  return params.map(param =>
    item(param.name, 'property', param.type || undefined, undefined, `${param.name}: `)
  );
}

function filterByPrefix(items, prefix) {
  if (!prefix) return finalize(items.slice(0, MAX_ITEMS));
  const needle = prefix.toLowerCase();
  const matched = [];
  for (const entry of items) {
    if (entry.label.toLowerCase().startsWith(needle)) matched.push(entry);
    if (matched.length >= MAX_ITEMS) break;
  }
  return finalize(matched);
}

// MARK: - Context routing

/** True when the cursor sits after a `.` that is not part of a numeric literal. */
function isMemberAccess(before) {
  const expr = before.replace(/\.\s*[A-Za-z0-9_$]*$/, '');
  if (expr === before) return false;
  return !/(?:^|[^\w$])\d+$/.test(expr);
}

function complete(params) {
  const source = typeof params.text === 'string' ? params.text : '';
  const offset = Math.max(0, Math.min(Number(params.offset) || 0, source.length));
  const before = source.slice(0, offset);
  const line = text.lineText(source, offset);
  const prefix = text.identifierPrefix(source, offset);

  if (/^\s*(?:import|export|part)\b/.test(line)) {
    const quoted = line.match(/(["'])([^"']*)$/);
    const typed = quoted ? quoted[2] : prefix;
    const items = filterByPrefix(moduleItems().items, typed);
    const separatorIndex = Math.max(typed.lastIndexOf(':'), typed.lastIndexOf('/'));
    if (separatorIndex < 0) return items;
    const separator = typed[separatorIndex];
    return items.map(entry => {
      const index = entry.label.lastIndexOf(separator);
      return index >= 0 ? { ...entry, insertText: entry.label.slice(index + 1) } : entry;
    });
  }

  if (/(?:^|[\s(])@[A-Za-z0-9_]*$/.test(before)) {
    return filterByPrefix(annotationItems().items, prefix);
  }

  if (text.lineIsLiteral(line, offset - text.lineRange(source, offset).start)) return [];

  if (isMemberAccess(before)) {
    const dot = offset - prefix.length - 1;
    const receiver = resolveReceiver(source.slice(0, dot));
    if (receiver) {
      if (receiver.type === 'Icons') return filterByPrefix(iconItems().items, prefix);
      if (receiver.type === 'Colors') return filterByPrefix(colorItems().items, prefix);
      if (receiver.type === 'Color' && !receiver.bare) return filterByPrefix(colorMemberItems().items, prefix);
      if (catalog.enumValues.has(receiver.type)) {
        const values = enumItems(receiver.type);
        return values ? filterByPrefix(values.items, prefix) : [];
      }
      const members = memberItems(receiver.type, receiver.bare);
      if (members) return filterByPrefix(members.items, prefix);
    }
    return filterByPrefix(genericItems().items, prefix);
  }

  const call = text.enclosingCall(source, offset);
  if (call) {
    const callee = text.calleeChain(source, call.openIndex);
    const target = callee && resolveCallable(callee.chain);
    if (!target) return [];

    const args = text.argumentContext(source, call.openIndex, offset);
    const param = args.paramName
      ? target.params.find(candidate => candidate.name === args.paramName)
      : null;

    if (param) {
      const enumType = catalog.enumTypeOf(param.type);
      if (enumType) {
        const values = enumItems(enumType);
        if (values) return filterByPrefix(values.items, args.valuePrefix || '');
      }
      if (/^bool\??$/.test(param.type.trim())) {
        return finalize([
          item('true', 'keyword', 'bool', undefined, 'true'),
          item('false', 'keyword', 'bool', undefined, 'false')
        ]);
      }
      const valuePrefix = (args.valuePrefix || '').trim();
      const base = ranked(valueSet(), valuePrefix);
      const specific = specificValueItems(param.type);
      if (!specific) return base;
      const extra = filterByPrefix(specific.items, valuePrefix);
      if (!extra.length) return base;
      const labels = new Set(extra.map(entry => entry.label));
      return finalize(extra.concat(base.filter(entry => !labels.has(entry.label))).slice(0, MAX_ITEMS));
    }

    if (target.named) {
      const items = parameterItems(target, args.used);
      return filterByPrefix(items, prefix);
    }
    return [];
  }

  return ranked(defaultSet(), prefix);
}

module.exports = { complete, MAX_ITEMS };
