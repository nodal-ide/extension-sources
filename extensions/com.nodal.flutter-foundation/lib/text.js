'use strict';

// Bounded text scanning helpers. Everything here is O(window), never O(document),
// except `mask`, which is document-wide and only used by symbols/diagnostics.

const IDENT = /[A-Za-z0-9_$]/;

function isIdentChar(ch) {
  return ch !== undefined && ch !== '\n' && IDENT.test(ch);
}

function identifierPrefix(text, offset) {
  let start = offset;
  while (start > 0 && isIdentChar(text[start - 1])) start--;
  return text.slice(start, offset);
}

function lineRange(text, offset) {
  const start = text.lastIndexOf('\n', offset - 1) + 1;
  const end = text.indexOf('\n', offset);
  return { start, end: end < 0 ? text.length : end };
}

function lineText(text, offset) {
  const { start, end } = lineRange(text, offset);
  return text.slice(start, end);
}

/** Masks comments and string literals, preserving offsets and newlines. */
function mask(text) {
  const out = text.split('');
  const n = text.length;
  let i = 0;
  let quote = null;
  while (i < n) {
    const ch = text[i];
    if (quote) {
      if (ch === '\\' && !quote.raw) {
        out[i] = ' ';
        if (i + 1 < n) out[i + 1] = ' ';
        i += 2;
        continue;
      }
      if (ch === quote.char) {
        if (quote.triple) {
          if (text[i + 1] === quote.char && text[i + 2] === quote.char) {
            out[i] = out[i + 1] = out[i + 2] = ' ';
            i += 3;
            quote = null;
            continue;
          }
        } else {
          out[i] = ' ';
          i++;
          quote = null;
          continue;
        }
      }
      if (ch !== '\n') out[i] = ' ';
      i++;
      continue;
    }
    if (ch === '/' && text[i + 1] === '/') {
      while (i < n && text[i] !== '\n') out[i++] = ' ';
      continue;
    }
    if (ch === '/' && text[i + 1] === '*') {
      let depth = 1;
      out[i] = out[i + 1] = ' ';
      i += 2;
      while (i < n && depth > 0) {
        if (text[i] === '/' && text[i + 1] === '*') {
          depth++;
          out[i] = out[i + 1] = ' ';
          i += 2;
          continue;
        }
        if (text[i] === '*' && text[i + 1] === '/') {
          depth--;
          out[i] = out[i + 1] = ' ';
          i += 2;
          continue;
        }
        if (text[i] !== '\n') out[i] = ' ';
        i++;
      }
      continue;
    }
    if ((ch === 'r' || ch === 'R') && (text[i + 1] === '"' || text[i + 1] === "'") && !isIdentChar(text[i - 1])) {
      out[i] = ' ';
      quote = { char: text[i + 1], triple: false, raw: true };
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const triple = text[i + 1] === ch && text[i + 2] === ch;
      quote = { char: ch, triple, raw: false };
      out[i] = ' ';
      if (triple) {
        out[i + 1] = out[i + 2] = ' ';
        i += 3;
      } else {
        i++;
      }
      continue;
    }
    i++;
  }
  return out.join('');
}

/** FNV-1a over UTF-16 code units; used to skip rebuilding document-wide indexes. */
function hashText(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

/**
 * Finds the innermost unclosed `(` before `offset`.
 * Returns `null` when the cursor is not inside a call's argument list (for example inside a
 * block or a nested list literal).
 */
function enclosingCall(text, offset, limit = 4096) {
  const start = Math.max(0, offset - limit);
  const window = mask(text.slice(start, offset));
  let paren = 0;
  let bracket = 0;
  let brace = 0;
  for (let i = window.length - 1; i >= 0; i--) {
    const ch = window[i];
    if (ch === ')') paren++;
    else if (ch === '(') {
      if (paren === 0) return { openIndex: start + i };
      paren--;
    } else if (ch === ']') bracket++;
    else if (ch === '[') {
      if (bracket === 0) return null;
      bracket--;
    } else if (ch === '}') brace++;
    else if (ch === '{') {
      if (brace === 0) return null;
      brace--;
    }
  }
  return null;
}

/** Reads the identifier (and dotted chain) immediately before `openIndex`. */
function calleeChain(text, openIndex) {
  let index = openIndex - 1;
  while (index >= 0 && (text[index] === ' ' || text[index] === '\t')) index--;
  const end = index + 1;
  while (index >= 0 && isIdentChar(text[index])) index--;
  if (end === index + 1) return null;
  const name = text.slice(index + 1, end);
  let chain = name;
  let cursor = index;
  while (cursor >= 0 && text[cursor] === '.') {
    let start = cursor - 1;
    while (start >= 0 && isIdentChar(text[start])) start--;
    const segment = text.slice(start + 1, cursor);
    if (!segment) break;
    chain = `${segment}.${chain}`;
    cursor = start - 1;
  }
  return { name, chain, start: index + 1 };
}

/** Text between the open paren and the cursor, plus the parameter names already typed. */
function argumentContext(text, openIndex, offset) {
  const segment = text.slice(openIndex + 1, offset);
  const depth0 = [];
  let depth = 0;
  let currentStart = 0;
  for (let i = 0; i < segment.length; i++) {
    const ch = segment[i];
    if (ch === '(' || ch === '[' || ch === '{') depth++;
    else if (ch === ')' || ch === ']' || ch === '}') depth--;
    else if (ch === ',' && depth === 0) {
      depth0.push(segment.slice(currentStart, i));
      currentStart = i + 1;
    }
  }
  const current = segment.slice(currentStart);
  const used = new Set();
  for (const part of depth0.concat([current.slice(0, current.lastIndexOf(',') + 1)])) {
    const match = part.match(/\b([A-Za-z_]\w*)\s*:/);
    if (match) used.add(match[1]);
  }
  const named = current.match(/^\s*([A-Za-z_]\w*)\s*:\s*([\s\S]*)$/);
  return {
    segment: current,
    used,
    paramName: named ? named[1] : null,
    valuePrefix: named ? named[2] : null
  };
}

/** Whether the line column sits inside a string literal or a `//` comment. */
function lineIsLiteral(line, column) {
  let quote = null;
  for (let i = 0; i < Math.min(column, line.length); i++) {
    const ch = line[i];
    if (quote) {
      if (ch === '\\') {
        i++;
        continue;
      }
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '/' && line[i + 1] === '/') return true;
    if (ch === '/' && line[i + 1] === '*') return true;
    if ((ch === 'r' || ch === 'R') && (line[i + 1] === '"' || line[i + 1] === "'")) continue;
    if (ch === '"' || ch === "'") quote = ch;
  }
  return quote !== null;
}

module.exports = {
  isIdentChar,
  lineIsLiteral,
  identifierPrefix,
  lineRange,
  lineText,
  mask,
  hashText,
  enclosingCall,
  calleeChain,
  argumentContext
};
