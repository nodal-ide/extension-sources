#!/usr/bin/env node
//
// Example CodeEdit language provider.
//
// Speaks JSON-RPC 2.0 over stdin/stdout: requests are newline-delimited JSON objects
// with an `id`; responses echo that `id`. Any language can implement this protocol —
// this sample is Node with no dependencies.

const SYMBOLS = [
  {
    name: 'component',
    kind: 'function',
    signature: 'component(string $name, array|object|null $props = [], array $slots = []): string',
    params: ['string $name', 'array|object|null $props = []', 'array $slots = []'],
    doc: 'Renders a view partial component.',
  },
  {
    name: 'controller',
    kind: 'function',
    signature: 'controller(string $name): object',
    params: ['string $name'],
    doc: 'Resolves a controller instance.',
  },
  {
    name: 'Repository',
    kind: 'class',
    doc: 'Base data repository.',
  },
];

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buffer += chunk;
  let index;
  while ((index = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, index).trim();
    buffer = buffer.slice(index + 1);
    if (line) {
      try {
        handle(JSON.parse(line));
      } catch (error) {
        // Ignore malformed input; a real provider would log to stderr.
      }
    }
  }
});

function send(object) {
  process.stdout.write(JSON.stringify(object) + '\n');
}
function reply(id, result) {
  send({ jsonrpc: '2.0', id, result });
}
function fail(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

function handle(message) {
  const { id, method, params = {} } = message;
  switch (method) {
    case 'initialize':
      return reply(id, { capabilities: ['completion', 'hover', 'definition', 'signatureHelp'] });
    case 'shutdown':
      return reply(id, null);
    case 'completion':
      return reply(id, complete(params));
    case 'hover':
      return reply(id, hover(params));
    case 'definition':
      return reply(id, definition(params));
    case 'signatureHelp':
      return reply(id, signatureHelp(params));
    case 'diagnostics':
      return reply(id, []);
    case 'documentSymbols':
      return reply(id, []);
    case 'codeActions':
      return reply(id, []);
    default:
      return fail(id, -32601, `Unknown method: ${method}`);
  }
}

const IDENTIFIER = /[A-Za-z0-9_\\]/;

function prefixAt(text, offset) {
  let index = offset;
  while (index > 0 && IDENTIFIER.test(text[index - 1])) index--;
  return text.slice(index, offset);
}

function wordAt(text, offset) {
  let start = offset;
  let end = offset;
  while (start > 0 && IDENTIFIER.test(text[start - 1])) start--;
  while (end < text.length && IDENTIFIER.test(text[end])) end++;
  return text.slice(start, end);
}

function complete({ text = '', offset = 0 }) {
  const prefix = prefixAt(text, offset).toLowerCase();
  return SYMBOLS
    .filter(symbol => symbol.name.toLowerCase().startsWith(prefix))
    .map(symbol => ({
      label: symbol.name,
      detail: symbol.signature || symbol.kind,
      documentation: symbol.doc,
      insertText: symbol.name + '()',
    }));
}

function symbolAt(text, offset) {
  const word = wordAt(text, offset);
  return SYMBOLS.find(symbol => symbol.name === word);
}

function hover({ text = '', offset = 0 }) {
  const symbol = symbolAt(text, offset);
  return symbol ? { contents: `${symbol.kind} ${symbol.signature || symbol.name}\n\n${symbol.doc}` } : null;
}

function definition({ text = '', offset = 0 }) {
  const symbol = symbolAt(text, offset);
  // No real file to jump to: point at the top of the current document.
  return symbol ? [{ location: 0, length: symbol.name.length }] : [];
}

function signatureHelp({ text = '', offset = 0 }) {
  const symbol = symbolAt(text, offset);
  return symbol ? { signature: symbol.signature, parameters: symbol.params || [], activeParameter: 0 } : null;
}
