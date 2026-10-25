#!/usr/bin/env node
//
// Nodal IDE Svelte Foundation provider.
//
// Dependency-free JSON-RPC 2.0 over stdin/stdout. Complements the native Svelte grammar pack with
// completion for markup directives, Svelte 5 runes, lifecycle/store APIs, script imports, and common
// JavaScript/CSS members.
//
// Requests are newline-delimited JSON objects with an `id`; responses echo that `id`.

'use strict';

const MODULES = [
  ['svelte', 'Svelte runtime and lifecycle APIs.'],
  ['svelte/store', 'Writable, readable, derived, and get.'],
  ['svelte/motion', 'Tweened and spring stores.'],
  ['svelte/transition', 'Built-in transitions.'],
  ['svelte/animate', 'Keyed each animation helpers.'],
  ['svelte/easing', 'Easing functions.'],
  ['svelte/action', 'Action type helpers.'],
  ['svelte/legacy', 'Compatibility helpers for Svelte 4 patterns.']
];

const EVENTS = [
  'click', 'dblclick', 'contextmenu', 'auxclick', 'input', 'change', 'submit', 'reset',
  'keydown', 'keyup', 'keypress', 'focus', 'blur', 'focusin', 'focusout',
  'mouseenter', 'mouseleave', 'mouseover', 'mouseout', 'mousedown', 'mouseup', 'mousemove',
  'pointerdown', 'pointerup', 'pointermove', 'pointerenter', 'pointerleave', 'pointerover',
  'pointerout', 'touchstart', 'touchend', 'touchmove', 'touchcancel',
  'dragstart', 'drag', 'dragend', 'dragenter', 'dragleave', 'dragover', 'drop',
  'wheel', 'scroll', 'resize', 'load', 'error', 'animationstart', 'animationend'
];

const BINDINGS = [
  'value', 'checked', 'group', 'files', 'this', 'innerHTML', 'textContent', 'innerText',
  'clientWidth', 'clientHeight', 'offsetWidth', 'offsetHeight', 'scrollTop', 'scrollLeft',
  'duration', 'currentTime', 'paused', 'volume', 'muted', 'buffered', 'seekable', 'played',
  'ended', 'readyState', 'videoWidth', 'videoHeight', 'naturalWidth', 'naturalHeight', 'complete'
];

const TRANSITIONS = ['fade', 'fly', 'slide', 'scale', 'blur', 'draw', 'crossfade'];

const EASING = [
  'linear', 'ease', 'easeIn', 'easeOut', 'easeInOut',
  'cubicIn', 'cubicOut', 'cubicInOut', 'quadIn', 'quadOut', 'quadInOut',
  'quartIn', 'quartOut', 'quartInOut', 'quintIn', 'quintOut', 'quintInOut',
  'sineIn', 'sineOut', 'sineInOut', 'expoIn', 'expoOut', 'expoInOut',
  'circIn', 'circOut', 'circInOut', 'backIn', 'backOut', 'backInOut',
  'elasticIn', 'elasticOut', 'elasticInOut', 'bounceIn', 'bounceOut', 'bounceInOut'
];

const RUNES = ['state', 'derived', 'effect', 'props', 'bindable', 'inspect', 'host'];
const BLOCKS = ['if', 'each', 'await', 'key', 'snippet'];
const BLOCK_CONTINUATIONS = ['else', 'then', 'catch'];
const SPECIAL_TAGS = ['html', 'debug', 'const', 'render'];
const SVELTE_ELEMENTS = [
  'svelte:head', 'svelte:window', 'svelte:body', 'svelte:options', 'svelte:component',
  'svelte:self', 'svelte:fragment', 'svelte:element', 'svelte:boundary'
];

const SVELTE_APIS = [
  ['onMount', 'Runs a callback after the component mounts.', 'onMount()'],
  ['onDestroy', 'Runs a callback before the component is destroyed.', 'onDestroy()'],
  ['beforeUpdate', 'Runs before the component updates.', 'beforeUpdate()'],
  ['afterUpdate', 'Runs after the component updates.', 'afterUpdate()'],
  ['tick', 'Resolves after pending state changes are applied.', 'tick()'],
  ['getContext', 'Reads a value from the component context.', 'getContext()'],
  ['setContext', 'Sets a value in the component context.', 'setContext()'],
  ['hasContext', 'Checks whether a context key exists.', 'hasContext()'],
  ['getAllContexts', 'Reads all component contexts.', 'getAllContexts()'],
  ['createEventDispatcher', 'Creates a component event dispatcher.', 'createEventDispatcher()'],
  ['writable', 'Creates a writable store.', 'writable()'],
  ['readable', 'Creates a readable store.', 'readable()'],
  ['derived', 'Creates a store derived from other stores.', 'derived()'],
  ['get', 'Reads a store value synchronously.', 'get()'],
  ['untrack', 'Reads state without creating a reactive dependency.', 'untrack()'],
  ['flushSync', 'Flushes pending state updates synchronously.', 'flushSync()'],
  ['fade', 'Fades a block in and out.', 'fade()'],
  ['fly', 'Moves a block in and out.', 'fly()'],
  ['slide', 'Slides a block in and out.', 'slide()'],
  ['scale', 'Scales a block in and out.', 'scale()'],
  ['blur', 'Blurs a block in and out.', 'blur()'],
  ['draw', 'Draws SVG strokes in and out.', 'draw()'],
  ['crossfade', 'Crossfades a block in and out.', 'crossfade()'],
  ['flip', 'Animates keyed each block reordering.', 'flip()']
];

const DIRECTIVES = [
  ['on:', 'Listen for a DOM event (Svelte 4 syntax).', 'on:'],
  ['bind:', 'Two-way bind to a DOM property or component prop.', 'bind:'],
  ['class:', 'Toggle a class from an expression.', 'class:'],
  ['style:', 'Set an inline style from an expression.', 'style:'],
  ['use:', 'Attach a Svelte action.', 'use:'],
  ['transition:', 'Animate a block in and out.', 'transition:'],
  ['in:', 'Animate a block when it enters.', 'in:'],
  ['out:', 'Animate a block when it leaves.', 'out:'],
  ['animate:', 'Animate reordered keyed each blocks.', 'animate:'],
  ['let:', 'Expose slot props to slot content.', 'let:']
];

const JS_KEYWORDS = [
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'do', 'switch',
  'case', 'break', 'continue', 'new', 'class', 'extends', 'super', 'this', 'typeof', 'instanceof',
  'in', 'of', 'try', 'catch', 'finally', 'throw', 'async', 'await', 'yield', 'import', 'from',
  'export', 'default', 'null', 'undefined', 'true', 'false', 'delete', 'void', 'with', 'debugger'
];

const JS_GLOBALS = [
  ['console', 'Developer console.', 'console'],
  ['JSON', 'JSON parsing and serialization.', 'JSON'],
  ['Math', 'Mathematical constants and functions.', 'Math'],
  ['Object', 'Object utilities.', 'Object'],
  ['Array', 'Array constructor and utilities.', 'Array'],
  ['Promise', 'Asynchronous result wrapper.', 'Promise'],
  ['Map', 'Key-value collection.', 'Map'],
  ['Set', 'Unique-value collection.', 'Set'],
  ['Date', 'Date and time values.', 'Date'],
  ['RegExp', 'Regular expressions.', 'RegExp'],
  ['fetch', 'Performs an HTTP request.', 'fetch()'],
  ['setTimeout', 'Runs a callback after a delay.', 'setTimeout()'],
  ['clearTimeout', 'Cancels a timeout.', 'clearTimeout()'],
  ['setInterval', 'Runs a callback repeatedly.', 'setInterval()'],
  ['clearInterval', 'Cancels an interval.', 'clearInterval()'],
  ['requestAnimationFrame', 'Runs a callback before the next repaint.', 'requestAnimationFrame()'],
  ['structuredClone', 'Deep-clones a value.', 'structuredClone()'],
  ['window', 'The browser window.', 'window'],
  ['document', 'The current document.', 'document'],
  ['localStorage', 'Persistent key-value storage.', 'localStorage'],
  ['sessionStorage', 'Session-scoped key-value storage.', 'sessionStorage']
];

const JS_MEMBERS = [
  ['then', 'Chains a fulfilled promise.', 'then()'],
  ['catch', 'Handles a rejected promise.', 'catch()'],
  ['finally', 'Runs after a promise settles.', 'finally()'],
  ['map', 'Transforms each element.', 'map()'],
  ['filter', 'Keeps matching elements.', 'filter()'],
  ['reduce', 'Combines elements into one value.', 'reduce()'],
  ['forEach', 'Calls a function for each element.', 'forEach()'],
  ['find', 'Finds the first matching element.', 'find()'],
  ['some', 'Tests whether any element matches.', 'some()'],
  ['every', 'Tests whether all elements match.', 'every()'],
  ['includes', 'Checks whether a value is present.', 'includes()'],
  ['join', 'Joins array elements into a string.', 'join()'],
  ['split', 'Splits a string.', 'split()'],
  ['trim', 'Trims whitespace from a string.', 'trim()'],
  ['toLowerCase', 'Returns a lowercase string.', 'toLowerCase()'],
  ['toUpperCase', 'Returns an uppercase string.', 'toUpperCase()'],
  ['replace', 'Replaces matching text.', 'replace()'],
  ['push', 'Adds an element to the end.', 'push()'],
  ['pop', 'Removes the last element.', 'pop()'],
  ['slice', 'Returns a shallow copy slice.', 'slice()'],
  ['splice', 'Adds or removes elements in place.', 'splice()'],
  ['concat', 'Combines arrays or strings.', 'concat()'],
  ['keys', 'Iterates keys.', 'keys()'],
  ['values', 'Iterates values.', 'values()'],
  ['entries', 'Iterates key-value pairs.', 'entries()'],
  ['text', 'Reads a response body as text.', 'text()'],
  ['json', 'Reads a response body as JSON.', 'json()'],
  ['length', 'The collection or string length.', 'length'],
  ['subscribe', 'Subscribes to a store.', 'subscribe()'],
  ['set', 'Sets a store value.', 'set()'],
  ['update', 'Updates a store value.', 'update()']
];

const CSS_PROPERTIES = [
  'align-items', 'align-content', 'background', 'background-color', 'border', 'border-radius',
  'bottom', 'box-shadow', 'box-sizing', 'color', 'cursor', 'display', 'fill', 'flex',
  'flex-direction', 'flex-grow', 'flex-shrink', 'flex-wrap', 'font-family', 'font-size',
  'font-style', 'font-weight', 'gap', 'grid-template-columns', 'grid-template-rows', 'height',
  'justify-content', 'left', 'letter-spacing', 'line-height', 'margin', 'max-height', 'max-width',
  'min-height', 'min-width', 'opacity', 'overflow', 'padding', 'position', 'right', 'stroke',
  'text-align', 'text-decoration', 'text-transform', 'top', 'transform', 'transition',
  'vertical-align', 'visibility', 'white-space', 'width', 'z-index'
];

function item(label, detail, documentation, insertText) {
  return { label, detail, documentation, insertText: insertText || label };
}

function words(values, kind) {
  return values.map(label => item(label, kind, '', label));
}

function wordPrefix(before) {
  const match = before.match(/[A-Za-z0-9_]+$/);
  return match ? match[0] : '';
}

function filterItems(items, prefix) {
  const needle = prefix.toLowerCase();
  const seen = new Set();
  const result = [];
  for (const entry of items) {
    if (seen.has(entry.label)) continue;
    if (needle && !entry.label.toLowerCase().startsWith(needle)) continue;
    seen.add(entry.label);
    result.push(entry);
    if (result.length >= 100) break;
  }
  return result;
}

function insideElement(before, tag) {
  const open = before.lastIndexOf(`<${tag}`);
  if (open < 0) return false;
  return open > before.lastIndexOf(`</${tag}`);
}

function moduleItems(line, prefix) {
  const quoted = line.match(/(['"])([^'"]*)$/);
  const typed = quoted ? quoted[2] : prefix;
  const needle = typed.toLowerCase();
  return MODULES
    .filter(([label]) => label.toLowerCase().startsWith(needle))
    .map(([label, doc]) => {
      // The editor replaces only the trailing identifier, so after "svelte/st" the
      // insertion must be "store", not the full module path.
      const insert = typed.includes('/') ? label.slice(label.lastIndexOf('/') + 1) : label;
      return item(label, 'module', doc, insert);
    });
}

function scriptItems(before, line, prefix) {
  if (/^\s*import\b/.test(line)) {
    return moduleItems(line, prefix);
  }
  const member = before.match(/([A-Za-z_$][A-Za-z0-9_$]*)\.([A-Za-z0-9_]*)$/);
  if (member) {
    return filterItems(
      JS_MEMBERS.map(([label, doc, insert]) => item(label, 'member', doc, insert)),
      prefix
    );
  }
  return filterItems([
    ...words(JS_KEYWORDS, 'keyword'),
    ...JS_GLOBALS.map(([label, doc, insert]) => item(label, 'global', doc, insert)),
    ...SVELTE_APIS.map(([label, doc, insert]) => item(label, 'Svelte API', doc, insert)),
    ...MODULES.map(([label, doc]) => item(label, 'module', doc, label))
  ], prefix);
}

function styleItems(typed) {
  const needle = typed.toLowerCase();
  return CSS_PROPERTIES
    .filter(label => label.toLowerCase().startsWith(needle))
    .map(label => {
      // "background-c" replaces only "c"; insert the segment after the last hyphen.
      const insert = typed.includes('-') ? label.slice(label.lastIndexOf('-') + 1) : label;
      return item(label, 'CSS property', '', insert);
    });
}

function markupItems(before, line, prefix) {
  if (/(^|[\s<])on:[A-Za-z0-9_-]*$/.test(before)) {
    return filterItems(words(EVENTS, 'event'), prefix);
  }
  if (/(^|[\s<])bind:[A-Za-z0-9_-]*$/.test(before)) {
    return filterItems(words(BINDINGS, 'binding'), prefix);
  }
  if (/(^|[\s<])(transition|in|out):[A-Za-z0-9_-]*$/.test(before)) {
    return filterItems(words(TRANSITIONS, 'transition'), prefix);
  }
  if (/(^|[\s<])animate:[A-Za-z0-9_-]*$/.test(before)) {
    return filterItems(words(['flip'], 'animation'), prefix);
  }
  if (/(^|[\s<])style:[A-Za-z0-9_-]*$/.test(before)) {
    const style = before.match(/style:([A-Za-z0-9_-]*)$/);
    return styleItems(style ? style[1] : prefix);
  }
  if (/(^|[\s<])(class|use|let):[A-Za-z0-9_-]*$/.test(before)) {
    return [];
  }

  const block = before.match(/\{#([A-Za-z0-9_]*)$/);
  if (block) {
    return filterItems(words(BLOCKS, 'block'), prefix);
  }
  const continuation = before.match(/\{:([A-Za-z0-9_]*)$/);
  if (continuation) {
    return filterItems(words(BLOCK_CONTINUATIONS, 'continuation'), prefix);
  }
  const special = before.match(/\{@([A-Za-z0-9_]*)$/);
  if (special) {
    return filterItems(words(SPECIAL_TAGS, 'special tag'), prefix);
  }

  const rune = before.match(/\$([A-Za-z0-9_]*)$/);
  if (rune) {
    return filterItems(words(RUNES, 'rune'), prefix);
  }

  const element = before.match(/<([A-Za-z][A-Za-z0-9:_-]*)?$/);
  if (element) {
    const typed = (element[1] || '').toLowerCase();
    return SVELTE_ELEMENTS
      .filter(label => label.toLowerCase().startsWith(typed))
      .map(label => {
        // After "<svelte:h" the editor replaces only "h", so insert "head".
        const insert = typed.includes(':') ? label.slice(label.lastIndexOf(':') + 1) : label;
        return item(label, 'Svelte element', '', insert);
      });
  }

  if (/^\s*import\b/.test(line)) {
    return moduleItems(line, prefix);
  }

  return filterItems([
    ...DIRECTIVES.map(([label, doc, insert]) => item(label, 'directive', doc, insert)),
    ...SVELTE_APIS.map(([label, doc, insert]) => item(label, 'Svelte API', doc, insert)),
    ...words(TRANSITIONS, 'transition'),
    ...words(EASING, 'easing'),
    ...words(RUNES.map(name => '$' + name), 'rune'),
    ...words(SVELTE_ELEMENTS, 'Svelte element'),
    ...MODULES.map(([label, doc]) => item(label, 'module', doc, label))
  ], prefix);
}

function complete(params) {
  const text = typeof params.text === 'string' ? params.text : '';
  const offset = Math.max(0, Math.min(Number(params.offset) || 0, text.length));
  const before = text.slice(0, offset);
  const lineStart = before.lastIndexOf('\n') + 1;
  const line = before.slice(lineStart);
  const prefix = wordPrefix(before);

  if (insideElement(before, 'script')) {
    return scriptItems(before, line, prefix);
  }
  if (insideElement(before, 'style')) {
    const token = before.match(/([A-Za-z-]+)$/);
    return styleItems(token ? token[1] : '');
  }
  return markupItems(before, line, prefix);
}

// MARK: - JSON-RPC transport

let buffer = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    try {
      handle(JSON.parse(line));
    } catch {
      // Malformed input is ignored; the host treats a missing response as a timeout.
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
      return reply(id, { capabilities: ['completion'] });
    case 'shutdown':
      return reply(id, null);
    case 'completion':
      return reply(id, complete(params));
    case 'hover':
    case 'definition':
    case 'signatureHelp':
      return reply(id, null);
    case 'diagnostics':
    case 'documentSymbols':
    case 'codeActions':
      return reply(id, []);
    default:
      return fail(id, -32601, `Unknown method: ${method}`);
  }
}
