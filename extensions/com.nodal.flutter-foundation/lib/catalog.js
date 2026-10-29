'use strict';

// Builds the lookup tables once per process from the data modules.

const { FLUTTER, NO_CTOR } = require('../data/flutter_widgets');
const { TYPES, FUNCTIONS, KEYWORDS, MEMBERS: CORE_MEMBERS, GENERIC_MEMBERS } = require('../data/dart_core');
const statics = require('../data/statics');
const MODULES = require('../data/modules');
const ANNOTATIONS = require('../data/annotations');

// Functions whose parameters are positional rather than named.
const POSITIONAL = new Set([
  'runApp', 'debugPrint', 'expect', 'group', 'testWidgets', 'scheduleFrameCallback', 'runZonedGuarded'
]);

function parseParams(source) {
  if (!source) return [];
  const params = [];
  const seen = new Set();
  for (const part of source.split('|')) {
    let trimmed = part.trim();
    if (!trimmed) continue;
    const positional = trimmed.startsWith('^');
    if (positional) trimmed = trimmed.slice(1).trim();
    const colon = trimmed.indexOf(':');
    let name = colon < 0 ? trimmed : trimmed.slice(0, colon);
    let type = colon < 0 ? '' : trimmed.slice(colon + 1);
    let required = false;
    if (name.endsWith('!')) {
      required = true;
      name = name.slice(0, -1);
    }
    if (type.endsWith('!')) {
      required = true;
      type = type.slice(0, -1);
    }
    if (!/^[A-Za-z_]\w*$/.test(name) || seen.has(name)) continue;
    seen.add(name);
    params.push({ name, type, required, positional });
  }
  return params;
}

const ENUM_ALIAS = {
  AlignmentGeometry: 'Alignment',
  AlignmentDirectional: 'Alignment',
  BorderRadiusGeometry: 'BorderRadius'
};

/** Enum type of a parameter type, e.g. `TextAlign?` or `List<Axis>` → `TextAlign`. */
function enumTypeOf(type) {
  if (!type) return null;
  const token = type.replace(/[?*]/g, '').replace(/<.*$/, '').trim();
  if (statics.ENUM_VALUES[token]) return token;
  if (ENUM_ALIAS[token] && statics.ENUM_VALUES[ENUM_ALIAS[token]]) return ENUM_ALIAS[token];
  const generic = type.match(/<([A-Za-z_]\w*)/);
  if (generic && statics.ENUM_VALUES[generic[1]]) return generic[1];
  return null;
}

const framework = new Map();
for (const [name, kind, doc, params] of FLUTTER) {
  framework.set(name, {
    name,
    kind,
    doc,
    params: parseParams(params),
    constructible: !NO_CTOR.has(name) && kind !== 'typedef' && kind !== 'enum' && kind !== 'mixin'
  });
}

// Named constructors per class, e.g. ListView → [builder, separated].
const namedConstructors = new Map();
for (const entry of framework.values()) {
  const dot = entry.name.indexOf('.');
  if (dot <= 0) continue;
  const owner = entry.name.slice(0, dot);
  const list = namedConstructors.get(owner) || [];
  list.push(entry);
  namedConstructors.set(owner, list);
}

const callables = new Map();
for (const entry of framework.values()) {
  if (!entry.params.length) continue;
  callables.set(entry.name, {
    name: entry.name,
    doc: entry.doc,
    kind: entry.kind,
    params: entry.params,
    named: entry.params.some(param => !param.positional) &&
      (entry.kind !== 'function' || !POSITIONAL.has(entry.name))
  });
}

const coreTypes = new Map(TYPES.map(([name, doc]) => [name, { name, doc }]));
const coreFunctions = new Map(FUNCTIONS.map(([name, signature, doc]) => [name, { name, signature, doc }]));
const annotations = new Map(ANNOTATIONS.map(([name, doc, hint]) => [name, { name, doc, hint }]));
const keywords = new Set(KEYWORDS);

const typeMembers = new Map();
function addMembers(type, list) {
  if (!list || !list.length) return;
  const existing = typeMembers.get(type) || [];
  const names = new Set(existing.map(member => member[0]));
  const merged = existing.slice();
  for (const [name, signature, doc] of list) {
    if (names.has(name)) continue;
    names.add(name);
    merged.push([name, signature, doc]);
  }
  typeMembers.set(type, merged);
}
for (const [type, list] of Object.entries(CORE_MEMBERS)) addMembers(type, list);
for (const [type, list] of Object.entries(statics.TYPE_MEMBERS)) addMembers(type, list);

const staticMembers = new Map(Object.entries(statics.STATIC_MEMBERS));
const enumValues = new Map(Object.entries(statics.ENUM_VALUES));

const colorDocs = new Map(statics.COLOR_NAMES);
const colorMembers = new Map(statics.COLOR_MEMBERS.map(member => [member[0], member]));
const widgetMembers = new Map(statics.WIDGET_MEMBERS.map(member => [member[0], member]));
const icons = new Set(statics.ICONS);

// Name → signature/doc used by hover and signature help.
const symbolIndex = new Map();
function signatureFor(entry) {
  if (entry.constructible) return `${entry.name}(${entry.params.length ? '{…}' : ''})`;
  if (entry.kind === 'enum') return `enum ${entry.name}`;
  if (entry.kind === 'mixin') return `mixin ${entry.name}`;
  if (entry.kind === 'typedef') return `typedef ${entry.name}`;
  return `class ${entry.name}`;
}

for (const entry of framework.values()) {
  symbolIndex.set(entry.name, {
    name: entry.name,
    signature: signatureFor(entry),
    doc: entry.doc,
    origin: entry.kind === 'typedef' ? 'Dart · typedef' : 'Flutter'
  });
}
for (const [name, entry] of coreTypes) {
  symbolIndex.set(name, { name, signature: `class ${name}`, doc: entry.doc, origin: 'Dart · core' });
}
for (const [name, entry] of coreFunctions) {
  symbolIndex.set(name, { name, signature: entry.signature, doc: entry.doc, origin: 'Dart · core' });
}
for (const [name, entry] of annotations) {
  symbolIndex.set(name, { name, signature: `@${name}`, doc: entry.doc, origin: 'Dart · annotation' });
}

const memberIndex = new Map();
function indexMembers(type, list) {
  for (const [name, signature, doc] of list) {
    if (!memberIndex.has(name)) memberIndex.set(name, { name, signature, doc, origin: type });
  }
}
for (const [type, list] of typeMembers) indexMembers(type, list);
for (const [name, member] of colorMembers) {
  memberIndex.set(name, { name, signature: member[1], doc: member[2], origin: 'Color' });
}

module.exports = {
  framework,
  namedConstructors,
  callables,
  coreTypes,
  coreFunctions,
  annotations,
  keywords,
  typeMembers,
  staticMembers,
  enumValues,
  colorDocs,
  colorMembers,
  widgetMembers,
  icons,
  symbolIndex,
  memberIndex,
  modules: MODULES,
  colors: statics.COLORS,
  colorNames: statics.COLOR_NAMES,
  iconsList: statics.ICONS,
  genericMembers: GENERIC_MEMBERS,
  enumTypeOf
};
