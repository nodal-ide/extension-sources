#!/usr/bin/env node
//
// Nodal IDE Dart & Flutter Foundation provider.
//
// Dependency-free JSON-RPC 2.0 over stdin/stdout. Dart syntax highlighting is built into Nodal;
// this provider adds catalog-driven completion, hover, signature help, document symbols and a few
// conservative Flutter diagnostics.
//
// Requests are newline-delimited JSON objects with an `id`; responses echo that `id`.

'use strict';

const { complete } = require('./lib/completion');
const { hover, signatureHelp } = require('./lib/hover');
const { scanSymbols } = require('./lib/symbols');
const { diagnose } = require('./lib/diagnostics');

const CAPABILITIES = ['completion', 'hover', 'signatureHelp', 'diagnostics', 'documentSymbols'];

function send(object) {
  try {
    process.stdout.write(`${JSON.stringify(object)}\n`);
  } catch {
    // The host closed the pipe; nothing useful left to do.
  }
}

function reply(id, result) {
  send({ jsonrpc: '2.0', id, result });
}

function fail(id, code, message) {
  send({ jsonrpc: '2.0', id, error: { code, message } });
}

function handle(message) {
  const { id, method, params = {} } = message || {};
  if (id === undefined || typeof method !== 'string') return;

  switch (method) {
    case 'initialize':
      return reply(id, { capabilities: CAPABILITIES });
    case 'shutdown':
      return reply(id, null);
    case 'completion':
      return reply(id, complete(params));
    case 'hover': {
      const content = hover(typeof params.text === 'string' ? params.text : '', Number(params.offset) || 0);
      return reply(id, content ? { contents: content } : null);
    }
    case 'signatureHelp':
      return reply(id, signatureHelp(
        typeof params.text === 'string' ? params.text : '',
        Number(params.offset) || 0,
        Number(params.argumentIndex) || 0
      ));
    case 'diagnostics':
      return reply(id, diagnose(params.text, params.file));
    case 'documentSymbols':
      return reply(id, scanSymbols(params.text));
    case 'definition':
    case 'codeActions':
      return reply(id, method === 'definition' ? null : []);
    default:
      return fail(id, -32601, `Unknown method: ${method}`);
  }
}

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    let message;
    try {
      message = JSON.parse(line);
    } catch {
      continue;
    }
    const { id, method } = message || {};
    try {
      handle(message);
    } catch (error) {
      if (id !== undefined) fail(id, -32603, error && error.message ? error.message : 'Internal error');
    }
  }
});

process.stdin.on('end', () => process.exit(0));
