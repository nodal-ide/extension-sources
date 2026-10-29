'use strict';

// Conservative diagnostics for exact, well-known Flutter API shapes.
// Only runs for files that import package:flutter, on comment/string-masked text.

const { mask, hashText } = require('./text');
const RULES = require('../data/rules');

const MAX_SOURCE = 500_000;
const MAX_ARGS = 4000;

let cache = { key: '', masked: '' };

function maskedSource(source) {
  const key = `${source.length}:${hashText(source)}`;
  if (cache.key !== key) cache = { key, masked: mask(source) };
  return cache.masked;
}

function declaredTypes(masked) {
  const names = new Set();
  const pattern = /\b(?:class|mixin|enum|extension|typedef)\s+([A-Za-z_]\w*)/g;
  let match;
  while ((match = pattern.exec(masked)) !== null) names.add(match[1]);
  return names;
}

function containerRule(masked) {
  const diagnostics = [];
  const pattern = /\bContainer\s*\(/g;
  let match;
  while ((match = pattern.exec(masked)) !== null) {
    const open = match.index + match[0].length - 1;
    const end = Math.min(masked.length, open + MAX_ARGS);
    let depth = 0;
    let close = -1;
    for (let i = open; i < end; i++) {
      const ch = masked[i];
      if (ch === '(') depth++;
      else if (ch === ')') {
        depth--;
        if (depth === 0) {
          close = i;
          break;
        }
      }
    }
    if (close < 0) continue;

    const args = masked.slice(open + 1, close);
    let argDepth = 0;
    let colorIndex = -1;
    let hasDecoration = false;
    for (let i = 0; i < args.length; i++) {
      const ch = args[i];
      if (ch === '(' || ch === '[' || ch === '{') argDepth++;
      else if (ch === ')' || ch === ']' || ch === '}') argDepth--;
      else if (argDepth === 0) {
        if (colorIndex < 0 && args.startsWith('color', i) && /^color\s*:/.test(args.slice(i))) {
          if (!/[A-Za-z0-9_$]/.test(args[i - 1] || '')) colorIndex = i;
        }
        if (args.startsWith('decoration', i) && /^decoration\s*:/.test(args.slice(i))) {
          if (!/[A-Za-z0-9_$]/.test(args[i - 1] || '')) hasDecoration = true;
        }
      }
    }
    if (colorIndex < 0 || !hasDecoration) continue;
    diagnostics.push({
      location: open + 1 + colorIndex,
      length: 'color'.length,
      severity: 'error',
      message: 'Container cannot take both color and decoration — move the color into the decoration.'
    });
  }
  return diagnostics;
}

function diagnose(source, file) {
  if (!source || source.length > MAX_SOURCE) return [];
  if (/\.(?:g|freezed|gr|mapper)\.dart$/.test(file || '')) return [];
  if (!/package:flutter\//.test(source)) return [];

  const masked = maskedSource(source);
  const declared = declaredTypes(masked);
  const diagnostics = [];

  for (const rule of RULES) {
    const pattern = new RegExp(rule.pattern.source, 'g');
    let match;
    while ((match = pattern.exec(masked)) !== null) {
      const label = match[1] || match[0].trim();
      if (declared.has(label)) continue;
      const length = rule.length(match);
      const location = match[1] ? match.index + match[0].indexOf(match[1]) : match.index;
      diagnostics.push({
        location,
        length,
        severity: rule.severity,
        message: rule.message(match[1] || label)
      });
      if (diagnostics.length >= 300) return diagnostics;
    }
  }

  diagnostics.push(...containerRule(masked));
  diagnostics.sort((a, b) => a.location - b.location);
  return diagnostics.slice(0, 300);
}

module.exports = { diagnose };
