#!/usr/bin/env node
//
// Dependency-free harness: spawns provider.js exactly like the host and asserts behaviour.
//
//   node test/run.js
//
// Exits non-zero on the first failing group; prints one line per check.

'use strict';

const path = require('path');
const { spawn } = require('child_process');

const PACK = path.join(__dirname, '..');
const child = spawn(process.execPath, [path.join(PACK, 'provider.js')], { cwd: PACK });

let buffer = '';
let nextId = 1;
const pending = new Map();

child.stdout.setEncoding('utf8');
child.stdout.on('data', chunk => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) >= 0) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    const message = JSON.parse(line);
    const resolve = pending.get(message.id);
    if (!resolve) continue;
    pending.delete(message.id);
    resolve(message);
  }
});

child.stderr.on('data', chunk => process.stderr.write(chunk));

function request(method, params = {}) {
  const id = nextId++;
  return new Promise((resolve, reject) => {
    pending.set(id, resolve);
    child.stdin.write(`${JSON.stringify({ jsonrpc: '2.0', id, method, params })}\n`);
    setTimeout(() => {
      if (pending.delete(id)) reject(new Error(`${method} timed out`));
    }, 5000);
  });
}

const completion = (text, marker = '|') =>
  request('completion', { file: '/tmp/main.dart', language: 'dart', offset: text.indexOf(marker), text: text.replace(marker, '') });

const hoverAt = (text, marker = '|') =>
  request('hover', { file: '/tmp/main.dart', language: 'dart', offset: text.indexOf(marker), text: text.replace(marker, '') });

let passed = 0;
const failures = [];
function check(name, condition, detail) {
  if (condition) {
    passed++;
    return;
  }
  failures.push(detail ? `${name} — ${detail}` : name);
}

const labels = items => items.map(item => item.label);

async function main() {
  const init = await request('initialize');
  check('initialize advertises capabilities', Array.isArray(init.result.capabilities) &&
    init.result.capabilities.includes('completion'));

  const empty = (await completion('void main() { | }')).result;
  check('empty prefix returns a bounded list', empty.length > 0 && empty.length <= 200, `${empty.length} items`);
  check('empty prefix leads with framework API',
    ['widget', 'class', 'constructor'].includes(empty[0].kind), JSON.stringify(empty[0]));
  check('empty prefix has no keyword first', empty[0].kind !== 'keyword');
  check('items carry label and insert text', empty.every(item => item.label && item.insertText && item.sortText));

  const roots = await Promise.all([
    completion('void main() { Icons.| }'),
    completion('void main() { Colors.| }'),
    completion('void main() { Theme.of(context).| }'),
    completion('void main() { Theme.of(context).textTheme.| }'),
    completion('void main() { MediaQuery.of(context).| }'),
    completion('void main() { Navigator.of(context).| }'),
    completion("void main() { 'abc'.| }"),
    completion('void main() { Future.| }')
  ]);
  const [icons, colors, theme, textTheme, media, navigator, string, future] = roots.map(response => response.result);

  check('Icons. offers icon constants', labels(icons).includes('home'));
  check('Colors. offers the palette', labels(colors).includes('red') && labels(colors).includes('blueGrey'));
  check('Colors.red. offers Color members', labels((await completion('void main() { Colors.red.| }')).result).includes('withValues'));
  check('Theme.of(context). offers ThemeData members', labels(theme).includes('colorScheme') && labels(theme).includes('textTheme'));
  check('textTheme. offers text roles', labels(textTheme).includes('bodyMedium') && labels(textTheme).includes('titleLarge'));
  check('MediaQuery.of(context). offers metrics', labels(media).includes('size') && labels(media).includes('textScaler'));
  check('Navigator.of(context). offers navigation', labels(navigator).includes('push') && labels(navigator).includes('pop'));
  check("string literal offers String members", labels(string).includes('padLeft') && labels(string).includes('startsWith'));
  check('Future. leads with statics', labels(future).includes('wait') && labels(future)[0] === 'wait');

  const distinct = new Set([icons, colors, theme, textTheme, media, navigator, string].map(list => labels(list).join(',')));
  check('receivers are mutually distinct', distinct.size === 7);

  const unknown = (await completion('void main() { mystery.| }')).result;
  check('unknown receiver falls back to generic members',
    labels(unknown).includes('build') && labels(unknown).length <= 100);

  const container = (await completion('void main() { Container(| }')).result;
  check('Container( lists named parameters',
    labels(container).includes('child') && labels(container).includes('padding') && labels(container).includes('color'));
  check('Container( inserts "name: "', container[0].insertText === 'child: ', container[0].insertText);
  check('Container( omits positional parameters', !labels(container).includes('data'));

  const used = (await completion('void main() { Container(color: Colors.red, | }')).result;
  check('already-used parameters are filtered', !labels(used).includes('color'));

  const alignment = (await completion('void main() { Container(alignment: | }')).result;
  check('enum-typed parameter suggests its values',
    labels(alignment).includes('center') && alignment.every(item => item.kind === 'enumcase'));

  const textAlign = (await completion("void main() { Text('x', textAlign: TextAlign.| }")).result;
  check('enum receiver suggests values', labels(textAlign).includes('justify'));

  const padding = (await completion('void main() { Padding(padding: | }')).result;
  check('parameter values rank the matching type first', labels(padding)[0] === 'EdgeInsets', labels(padding).slice(0, 3).join(','));

  const textArgs = (await completion('void main() { Text(| }')).result;
  check('Text( lists named parameters', labels(textArgs).includes('style') && !labels(textArgs).includes('data'));

  check('unknown callee opens no window', (await completion('void main() { whatever(| }')).result.length === 0);
  check('positional callee opens no window', (await completion('void main() { EdgeInsets.all(| }')).result.length === 0);

  const importItems = (await completion("import 'package:flutter/m|")).result;
  check('import completion offers the module', labels(importItems).includes('package:flutter/material.dart'));
  check('import completion inserts only the remainder', importItems[0].insertText === 'material.dart', importItems[0].insertText);

  const annotations = (await completion('@imm|')).result;
  check('annotation completion works', labels(annotations).includes('immutable'));

  check('completion stays quiet inside a string', (await completion('void main() { final s = "wor| }')).result.length === 0);
  check('completion stays quiet inside a comment', (await completion('void main() { // Cont| }')).result.length === 0);

  const prefixed = (await completion('void main() { Cont| }')).result;
  check('prefix completion reaches Container', labels(prefixed).includes('Container'));

  const constructors = (await completion('void main() { ListView.| }')).result;
  check('named constructors are reachable after a class name',
    labels(constructors).includes('builder') && constructors[0].insertText === 'builder($1)',
    JSON.stringify(constructors.slice(0, 2)));

  const imageConstructors = (await completion('void main() { Image.net| }')).result;
  check('named constructor prefix filters to one item',
    imageConstructors.length === 1 && imageConstructors[0].label === 'network');

  const paddingArgs = (await completion('void main() { Padding(| }')).result;
  check('required parameters come first', labels(paddingArgs)[0] === 'padding', labels(paddingArgs).join(','));

  const kinds = new Set(empty.map(item => item.kind));
  check('framework items carry kind icons', kinds.has('widget') && kinds.has('class'));
  const scaffoldItem = empty.find(item => item.label === 'Scaffold');
  check('constructible widgets insert a snippet', scaffoldItem && scaffoldItem.snippet === true);
  const abstractItem = empty.find(item => item.label === 'Widget');
  check('non-constructible types insert a bare name', abstractItem && !abstractItem.snippet);

  const hoverWidget = (await hoverAt('Container|()')).result;
  check('hover explains framework symbols', hoverWidget && hoverWidget.contents.includes('Container') &&
    hoverWidget.contents.includes('Flutter'), hoverWidget && hoverWidget.contents);

  const hoverIcon = (await hoverAt('Icons.home|')).result;
  check('hover explains icon constants', hoverIcon && hoverIcon.contents.includes('IconData'));

  const hoverStatic = (await hoverAt('Theme.of|(context)')).result;
  check('hover explains static methods', hoverStatic && hoverStatic.contents.includes('ThemeData of'));

  const hoverMissing = (await hoverAt('mystery|')).result;
  check('hover returns nothing for unknown symbols', hoverMissing === null);

  const signature = (await request('signatureHelp', {
    file: '/tmp/main.dart',
    language: 'dart',
    offset: 0,
    argumentIndex: 1,
    text: 'Padding(padding: EdgeInsets.all(8), child: Text("x"))'
  })).result;
  check('signature help names the parameters',
    signature && signature.parameters.length === 2 && signature.signature.startsWith('Padding('));
  check('signature help tracks the active parameter', signature && signature.activeParameter === 1);

  const symbols = (await request('documentSymbols', {
    file: '/tmp/main.dart',
    language: 'dart',
    text: [
      "import 'package:flutter/material.dart';",
      '',
      'class HomePage extends StatefulWidget {',
      '  const HomePage({super.key});',
      '',
      '  @override',
      '  State<HomePage> createState() => _HomePageState();',
      '}',
      '',
      'class _HomePageState extends State<HomePage> {',
      '  int count = 0;',
      '',
      '  void _increment() {',
      "    setState(() {});",
      '  }',
      '}',
      '',
      'enum Mode { light, dark }',
      '',
      'Future<void> load() async {}',
      '// class NotAClass',
      ''
    ].join('\n')
  })).result;
  const symbolNames = symbols.map(symbol => symbol.name);
  check('symbols list classes, members and enums',
    symbolNames.includes('HomePage') && symbolNames.includes('_increment') && symbolNames.includes('Mode'));
  check('symbols mark constructors', symbols.some(s => s.name === 'HomePage' && s.detail.startsWith('constructor')));
  check('symbols skip comments', !symbolNames.includes('NotAClass'));

  const diagnostics = (await request('diagnostics', {
    file: '/tmp/main.dart',
    language: 'dart',
    text: [
      "import 'package:flutter/material.dart';",
      'void main() {',
      '  // RaisedButton in a comment is fine',
      "  final text = 'RaisedButton';",
      '  RaisedButton(onPressed: () {});',
      '  WillPopScope(child: Container());',
      '  Container(color: Colors.red, decoration: BoxDecoration());',
      '  Colors.red.withOpacity(0.5);',
      '  Container(color: Colors.blue);',
      '}'
    ].join('\n')
  })).result;
  check('diagnostics report each rule once', diagnostics.length === 4, `${diagnostics.length} diagnostics`);
  check('diagnostics skip comments and strings',
    diagnostics.every(diagnostic => diagnostic.location > 40));
  check('diagnostics flag color plus decoration',
    diagnostics.some(diagnostic => diagnostic.severity === 'error' && diagnostic.message.includes('decoration')));

  const quiet = (await request('diagnostics', {
    file: '/tmp/main.dart',
    language: 'dart',
    text: "import 'package:flutter/material.dart';\nclass RaisedButton {}\nvoid main() { RaisedButton(); }"
  })).result;
  check('diagnostics respect user-declared types', quiet.length === 0);

  const generated = (await request('diagnostics', {
    file: '/tmp/model.g.dart',
    language: 'dart',
    text: "import 'package:flutter/material.dart';\nvoid main() { RaisedButton(); }"
  })).result;
  check('diagnostics skip generated files', generated.length === 0);

  const nonFlutter = (await request('diagnostics', {
    file: '/tmp/plain.dart',
    language: 'dart',
    text: 'void main() { print(1); }'
  })).result;
  check('diagnostics skip non-Flutter files', nonFlutter.length === 0);

  let source = "import 'package:flutter/material.dart';\n";
  for (let index = 0; index < 1200; index++) {
    source += `class W${index} extends StatelessWidget {\n  const W${index}({super.key});\n`
      + `  Widget build(BuildContext context) => Container(alignment: Alignment.center);\n}\n`;
  }
  const times = [];
  for (let run = 0; run < 20; run++) {
    const start = process.hrtime.bigint();
    await request('completion', { file: '/tmp/big.dart', language: 'dart', offset: source.length, text: source });
    times.push(Number(process.hrtime.bigint() - start) / 1e6);
  }
  times.sort((a, b) => a - b);
  check('completion stays inside budget on a 200 KB file',
    times[10] < 15, `median ${times[10].toFixed(2)}ms p95 ${times[18].toFixed(2)}ms`);

  const unknownMethod = await request('nope');
  check('unknown methods return an RPC error', unknownMethod.error && unknownMethod.error.code === -32601);

  const shutdown = await request('shutdown');
  check('shutdown replies', shutdown.result === null);

  child.kill();

  for (const failure of failures) console.error(`FAIL ${failure}`);
  console.log(`${passed} checks passed, ${failures.length} failed`);
  if (failures.length) process.exit(1);
}

main().catch(error => {
  console.error(error);
  child.kill();
  process.exit(1);
});
