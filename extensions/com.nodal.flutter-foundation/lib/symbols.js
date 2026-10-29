'use strict';

// Document symbols: one masked pass, then a line scan with brace-depth tracking.

const { mask } = require('./text');

const DECLARATION = /^\s*(?:abstract\s+|base\s+|final\s+|sealed\s+|interface\s+)*(class|mixin|enum|extension|typedef)\s+([A-Za-z_]\w*)/;
const MEMBER = /^\s{1,}(?:@[A-Za-z_]\w*(?:\([^)]*\))?\s+)*(?:static\s+)?(?:final\s+)?(?:const\s+)?(?:late\s+)?([A-Za-z_][\w<>?,\[\] ]*?)\s+([A-Za-z_]\w*)\s*\(/;
const TOP_LEVEL = /^\s*(?:external\s+|Future(?:Or)?<[^>]*>\s+|void\s+|int\s+|double\s+|num\s+|String\s+|bool\s+|dynamic\s+|Widget\s+|var\s+)*(?:([A-Za-z_][\w<>?,\[\] ]*?)\s+)?([A-Za-z_]\w*)\s*\([^;]*$/;
const VARIABLE = /^\s*(?:final|const|var|late)\s+(?:[A-Za-z_][\w<>?,\[\] ]*\s+)?([A-Za-z_]\w*)\s*[=;]/;
const CONTROL = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'else', 'do', 'try', 'assert', 'throw',
  'when', 'case', 'await', 'yield', 'setState', 'super', 'this'
]);

function scanSymbols(source) {
  if (!source) return [];
  const masked = mask(source);
  const lines = masked.split('\n');
  const symbols = [];
  const classes = [];
  let depth = 0;
  let offset = 0;

  for (const line of lines) {
    const lineOffset = offset;
    offset += line.length + 1;

    while (classes.length && depth <= classes[classes.length - 1].depth) classes.pop();

    const declaration = line.match(DECLARATION);
    if (declaration) {
      const kind = declaration[1];
      const name = declaration[2];
      const index = line.indexOf(name, declaration.index);
      symbols.push({
        name,
        detail: kind === 'extension' ? 'extension' : kind,
        location: lineOffset + (index < 0 ? 0 : index)
      });
      if (kind === 'class' || kind === 'mixin') classes.push({ name, depth });
    } else if (line.trim()) {
      const owner = classes[classes.length - 1];
      if (owner && depth > owner.depth) {
        const member = line.match(MEMBER);
        if (member && !CONTROL.has(member[2])) {
          const index = line.lastIndexOf(member[2]);
          const isConstructor = member[2] === owner.name || /^(?:const|factory|new)$/.test(member[1].trim());
          symbols.push({
            name: member[2],
            detail: isConstructor ? `constructor · ${owner.name}` : `${member[1].trim()} · ${owner.name}`,
            location: lineOffset + (index < 0 ? 0 : index)
          });
        }
      } else if (depth === 0) {
        const variable = line.match(VARIABLE);
        if (variable && !CONTROL.has(variable[1])) {
          symbols.push({
            name: variable[1],
            detail: 'variable',
            location: lineOffset + line.indexOf(variable[1])
          });
        } else if (!line.trimStart().startsWith('import') && !line.trimStart().startsWith('export')) {
          const top = line.match(TOP_LEVEL);
          if (top && top[2] && !CONTROL.has(top[2]) && !line.includes('=')) {
            symbols.push({
              name: top[2],
              detail: top[1] ? `${top[1].trim()} · function` : 'function',
              location: lineOffset + line.lastIndexOf(top[2])
            });
          }
        }
      }
    }

    for (const ch of line) {
      if (ch === '{') depth++;
      else if (ch === '}') depth = Math.max(0, depth - 1);
    }
    if (symbols.length >= 500) break;
  }

  return symbols.sort((a, b) => a.location - b.location);
}

module.exports = { scanSymbols };
