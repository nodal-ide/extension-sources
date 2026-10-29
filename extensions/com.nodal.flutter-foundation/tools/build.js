#!/usr/bin/env node
//
// Data validator for the Dart & Flutter pack. Dependency-free:
//
//   node tools/build.js
//
// Exits non-zero when the catalog is inconsistent or a coverage target regressed.

'use strict';

const path = require('path');
const { FLUTTER, NO_CTOR } = require('../data/flutter_widgets');
const { TYPES, FUNCTIONS, KEYWORDS, MEMBERS } = require('../data/dart_core');
const statics = require('../data/statics');
const MODULES = require('../data/modules');
const ANNOTATIONS = require('../data/annotations');
const RULES = require('../data/rules');

const issues = [];
const fail = message => issues.push(message);

function checkUnique(values, label) {
  const seen = new Set();
  for (const value of values) {
    if (seen.has(value)) fail(`${label}: duplicate "${value}"`);
    seen.add(value);
  }
}

// Names the upgrade promised to cover (plan §1.2), plus the Dart core gaps.
const COVERAGE = [
  'GestureDetector', 'InkWell', 'Wrap', 'AspectRatio', 'FittedBox', 'LayoutBuilder',
  'RefreshIndicator', 'ReorderableListView', 'Dismissible', 'PageView', 'NavigationRail',
  'PopupMenuButton', 'ExpansionTile', 'TextSpan', 'TextEditingController', 'ScrollController',
  'AnimatedBuilder', 'AnimatedSwitcher', 'ValueListenableBuilder', 'Visibility', 'Opacity',
  'MaterialPageRoute', 'PopScope', 'ColorScheme', 'TextTheme', 'ThemeData', 'Tooltip',
  'SliverAppBar', 'SegmentedButton', 'SearchBar', 'FilterChip', 'CupertinoButton',
  'CupertinoNavigationBar', 'CupertinoPageScaffold', 'Texture', 'ListenableBuilder',
  'SliverToBoxAdapter', 'SliverGrid', 'MenuAnchor', 'NavigationBar'
];

const DART_COVERAGE = ['StringBuffer', 'Completer', 'Timer', 'Random', 'Queue', 'StackTrace'];
const FUNCTION_COVERAGE = ['jsonEncode', 'jsonDecode', 'utf8', 'base64Encode'];
const MEMBER_COVERAGE = {
  String: ['padLeft', 'startsWith', 'endsWith', 'replaceFirst', 'codeUnits', 'runes'],
  List: ['reversed', 'expand', 'whereType'],
  Future: ['wait', 'delayed', 'timeout'],
  Map: ['putIfAbsent', 'entries']
};

// Structural checks.
const names = FLUTTER.map(entry => entry[0]);
checkUnique(names, 'flutter.widgets');
checkUnique(statics.ICONS, 'statics.icons');
checkUnique(statics.COLORS, 'statics.colors');
checkUnique(statics.COLOR_NAMES.map(entry => entry[0]), 'statics.colorNames');
checkUnique(MODULES.map(entry => entry[0]), 'modules');
checkUnique(ANNOTATIONS.map(entry => entry[0]), 'annotations');
checkUnique(KEYWORDS, 'keywords');
checkUnique(TYPES.map(entry => entry[0]), 'dart.types');
checkUnique(FUNCTIONS.map(entry => entry[0]), 'dart.functions');
checkUnique(RULES.map(rule => rule.id), 'rules');

const KINDS = new Set(['widget', 'class', 'mixin', 'enum', 'typedef', 'function', 'constructor']);
for (const entry of FLUTTER) {
  if (entry.length !== 3 && entry.length !== 4) fail(`widget "${entry[0]}": expected [name, kind, doc[, params]]`);
  const [name, kind, doc, params] = entry;
  if (!KINDS.has(kind)) fail(`widget "${name}": unknown kind "${kind}"`);
  if (!doc || doc.length < 8) fail(`widget "${name}": missing documentation`);
  if (params === undefined) continue;
  for (const part of params.split('|')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const colon = trimmed.indexOf(':');
    if (colon < 0) fail(`widget "${name}": parameter "${trimmed}" has no type`);
  }
}

for (const [name, doc] of TYPES) if (!doc) fail(`type "${name}": missing documentation`);
for (const [name, signature, doc] of FUNCTIONS) {
  if (!signature || signature.length < 4) fail(`function "${name}": signature is missing`);
  if (!doc) fail(`function "${name}": missing documentation`);
}
for (const [type, members] of Object.entries(MEMBERS)) {
  checkUnique(members.map(member => member[0]), `dart.members.${type}`);
  for (const [name, signature] of members) {
    if (!signature) fail(`member "${type}.${name}": missing signature`);
  }
}
for (const [type, members] of Object.entries(statics.TYPE_MEMBERS)) {
  for (const [name, signature] of members) {
    if (!signature) fail(`type member "${type}.${name}": missing signature`);
  }
}
for (const [type, values] of Object.entries(statics.ENUM_VALUES)) {
  checkUnique(values, `statics.ENUM_VALUES.${type}`);
}
for (const rule of RULES) {
  if (!rule.pattern.global) fail(`rule "${rule.id}": pattern must be global`);
  if (typeof rule.message !== 'function') fail(`rule "${rule.id}": message must be a function`);
}

const widgetNames = new Set(names);
for (const name of COVERAGE) if (!widgetNames.has(name)) fail(`coverage: missing widget "${name}"`);

const typeNames = new Set(TYPES.map(entry => entry[0]));
for (const name of DART_COVERAGE) if (!typeNames.has(name)) fail(`coverage: missing type "${name}"`);

const functionNames = new Set(FUNCTIONS.map(entry => entry[0]));
for (const name of FUNCTION_COVERAGE) if (!functionNames.has(name)) fail(`coverage: missing function "${name}"`);

for (const [type, members] of Object.entries(MEMBER_COVERAGE)) {
  const available = new Set([...(MEMBERS[type] || []), ...(statics.TYPE_MEMBERS[type] || [])].map(m => m[0]));
  for (const name of members) if (!available.has(name)) fail(`coverage: missing member "${type}.${name}"`);
}

if (NO_CTOR.size === 0) fail('NO_CTOR is empty');

const summary = {
  widgets: FLUTTER.length,
  dartTypes: TYPES.length,
  dartFunctions: FUNCTIONS.length,
  keywords: KEYWORDS.length,
  icons: statics.ICONS.length,
  colors: statics.COLORS.length,
  enums: Object.keys(statics.ENUM_VALUES).length,
  modules: MODULES.length,
  annotations: ANNOTATIONS.length,
  rules: RULES.length
};

for (const [key, value] of Object.entries(summary)) console.log(`${key}: ${value}`);

if (issues.length) {
  console.error(`\n${issues.length} issue(s):`);
  for (const issue of issues) console.error(`  - ${issue}`);
  process.exit(1);
}
console.log(`\nOK — ${path.basename(process.cwd())} catalog is consistent.`);
