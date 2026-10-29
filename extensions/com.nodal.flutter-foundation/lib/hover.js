'use strict';

// Hover documentation and signature help, both driven by the same catalog as completion.

const catalog = require('./catalog');
const text = require('./text');
const { resolveReceiver, resolveCallable } = require('./resolve');

const MAX_HOVER = 320;

function expressionAt(source, offset) {
  let start = Math.min(offset, source.length);
  while (start > 0 && /[A-Za-z0-9_$.]/.test(source[start - 1])) start--;
  while (start < offset && source[start] === '.') start++;
  let end = Math.min(offset, source.length);
  while (end < source.length && /[A-Za-z0-9_$]/.test(source[end])) end++;
  return { expression: source.slice(start, end), start, end };
}

function memberEntry(type, bare, name) {
  if (type === 'Icons') {
    if (!catalog.icons.has(name)) return null;
    return { signature: `static const IconData ${name}`, doc: 'Material icon constant.', origin: 'Icons' };
  }
  if (type === 'Colors') {
    if (!catalog.colors.includes(name)) return null;
    return {
      signature: `static const MaterialColor ${name}`,
      doc: catalog.colorDocs.get(name) || 'Material color.',
      origin: 'Colors'
    };
  }
  if (type === 'Color') {
    const member = catalog.colorMembers.get(name);
    return member ? { signature: member[1], doc: member[2], origin: 'Color' } : null;
  }
  const lists = [];
  if (bare) lists.push(catalog.staticMembers.get(type));
  lists.push(catalog.typeMembers.get(type));
  for (const list of lists) {
    if (!list) continue;
    const found = list.find(member => member[0] === name);
    if (found) return { signature: found[1], doc: found[2], origin: type };
  }
  return null;
}

function hover(source, offset) {
  const { expression } = expressionAt(source, offset);
  if (!expression) return null;

  const known = catalog.symbolIndex.get(expression);
  if (known) return format(known);

  const dot = expression.lastIndexOf('.');
  const name = dot >= 0 ? expression.slice(dot + 1) : expression;
  if (!name) return null;

  if (dot > 0) {
    const receiver = resolveReceiver(expression.slice(0, dot));
    if (receiver) {
      const entry = memberEntry(receiver.type, receiver.bare, name);
      if (entry) return format(entry);
    }
  }

  if (catalog.enumValues.has(expression)) {
    const values = catalog.enumValues.get(expression);
    return format({ signature: `enum ${expression}`, doc: values.join(', '), origin: 'Flutter · enum' });
  }

  const member = catalog.memberIndex.get(name);
  if (member) return format(member);

  const annotation = catalog.annotations.get(name);
  if (annotation) return format({ signature: `@${name}`, doc: annotation.doc, origin: 'Dart · annotation' });

  return null;
}

function format(entry) {
  const lines = [];
  if (entry.signature) lines.push(entry.signature);
  if (entry.doc) lines.push(entry.doc);
  if (entry.origin) lines.push(entry.origin);
  const content = lines.join('\n').trim();
  if (!content) return null;
  return content.length > MAX_HOVER ? `${content.slice(0, MAX_HOVER - 1)}…` : content;
}

function parameterLabel(param) {
  const type = param.type || 'dynamic';
  return `${param.required ? 'required ' : ''}${type} ${param.name}`;
}

function signatureHelp(source, calleeStart, argumentIndex) {
  const { chain } = text.calleeChain(source, source.indexOf('(', calleeStart));
  const target = resolveCallable(chain);
  if (!target || !target.params.length) return null;

  const params = target.params.slice(0, 10);
  const inner = params.map(parameterLabel).join(', ');
  const suffix = target.params.length > params.length ? ', …' : '';
  const signature = target.named
    ? `${target.name}({${inner}${suffix}})`
    : `${target.name}(${inner}${suffix})`;

  return {
    signature,
    parameters: params.map(parameterLabel),
    activeParameter: Math.max(0, Math.min(argumentIndex, params.length - 1))
  };
}

module.exports = { hover, signatureHelp };
