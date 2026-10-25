#!/usr/bin/env node
//
// Nodal IDE Dart & Flutter Foundation provider.
//
// Dependency-free JSON-RPC 2.0 over stdin/stdout. Dart syntax highlighting is built into
// Nodal's language catalog; this provider adds completion for Dart core APIs and the Flutter
// widgets/material/cupertino surface used by most Flutter apps.
//
// Requests are newline-delimited JSON objects with an `id`; responses echo that `id`.

'use strict';

const MODULES = [
  ['dart:async', 'Futures, streams, timers, and zones.'],
  ['dart:convert', 'JSON, UTF-8, base64, and codec utilities.'],
  ['dart:core', 'Core types and collection APIs.'],
  ['dart:io', 'Files, directories, sockets, and processes.'],
  ['dart:isolate', 'Isolates and message ports.'],
  ['dart:math', 'Math functions, random numbers, and constants.'],
  ['dart:typed_data', 'Typed byte buffers and views.'],
  ['dart:ffi', 'Foreign function interface.'],
  ['package:flutter/material.dart', 'Material Design widgets and theme.'],
  ['package:flutter/widgets.dart', 'Framework widgets and building blocks.'],
  ['package:flutter/cupertino.dart', 'Cupertino (iOS-style) widgets.'],
  ['package:flutter/services.dart', 'Platform services, input, and assets.'],
  ['package:flutter/foundation.dart', 'Foundation utilities and diagnostics.'],
  ['package:flutter/rendering.dart', 'Rendering tree and layout types.'],
  ['package:flutter/animation.dart', 'Animation controllers and curves.'],
  ['package:flutter/gestures.dart', 'Gesture recognizers and pointers.'],
  ['package:flutter/painting.dart', 'Painting, colors, and text styles.'],
  ['package:flutter_riverpod/flutter_riverpod.dart', 'Riverpod state management.'],
  ['package:provider/provider.dart', 'Provider state management.'],
  ['package:flutter_bloc/flutter_bloc.dart', 'Bloc state management.'],
  ['package:go_router/go_router.dart', 'Declarative routing.'],
  ['package:dio/dio.dart', 'HTTP client.'],
  ['package:http/http.dart', 'HTTP requests.'],
  ['package:shared_preferences/shared_preferences.dart', 'Simple key-value persistence.'],
  ['package:path_provider/path_provider.dart', 'Platform directories.']
];

const KEYWORDS = [
  'abstract', 'as', 'async', 'await', 'base', 'break', 'case', 'catch', 'class', 'const',
  'continue', 'covariant', 'default', 'deferred', 'do', 'dynamic', 'else', 'enum', 'export',
  'extends', 'extension', 'external', 'factory', 'false', 'final', 'finally', 'for', 'get',
  'hide', 'if', 'implements', 'import', 'in', 'interface', 'is', 'late', 'library', 'mixin',
  'new', 'null', 'on', 'operator', 'part', 'required', 'rethrow', 'return', 'sealed', 'set',
  'show', 'static', 'super', 'switch', 'sync', 'this', 'throw', 'true', 'try', 'typedef',
  'var', 'void', 'when', 'while', 'with', 'yield'
];

const TYPES = [
  ['Object', 'The root of the Dart class hierarchy.'],
  ['Never', 'A type with no values.'],
  ['dynamic', 'A value whose type is checked at runtime.'],
  ['int', 'A 64-bit integer.'],
  ['double', 'A double-precision floating-point number.'],
  ['num', 'The common supertype of int and double.'],
  ['String', 'A sequence of UTF-16 code units.'],
  ['bool', 'A Boolean value.'],
  ['List', 'An ordered collection.'],
  ['Map', 'A key-value collection.'],
  ['Set', 'An unordered collection of unique values.'],
  ['Iterable', 'A lazily evaluated sequence.'],
  ['Future', 'A value that completes asynchronously.'],
  ['Stream', 'An asynchronous sequence of events.'],
  ['Duration', 'A span of time.'],
  ['DateTime', 'A date and time.'],
  ['Uri', 'A parsed URI.'],
  ['RegExp', 'A regular expression.'],
  ['Function', 'The base type for callable objects.'],
  ['Record', 'A structural tuple/record type.']
];

const FUNCTIONS = [
  ['print', 'void print(Object? object)', 'Writes a value to standard output.', 'print()'],
  ['debugPrint', 'void debugPrint(String? message)', 'Prints a message through the framework debug printer.', 'debugPrint()'],
  ['assert', 'void assert(bool condition, [Object? message])', 'Fails in debug mode when the condition is false.', 'assert()'],
  ['identical', 'bool identical(Object? a, Object? b)', 'Whether two references are the same object.', 'identical()'],
  ['runApp', 'void runApp(Widget app)', 'Inflates the given widget and attaches it to the screen.', 'runApp()'],
  ['showDialog', 'Future<T?> showDialog<T>(...)', 'Shows a Material dialog.', 'showDialog()'],
  ['showModalBottomSheet', 'Future<T?> showModalBottomSheet<T>(...)', 'Shows a modal Material bottom sheet.', 'showModalBottomSheet()'],
  ['showDatePicker', 'Future<DateTime?> showDatePicker(...)', 'Shows a Material date picker.', 'showDatePicker()'],
  ['showTimePicker', 'Future<TimeOfDay?> showTimePicker(...)', 'Shows a Material time picker.', 'showTimePicker()']
];

const WIDGETS = [
  ['Widget', 'The base class for Flutter UI objects.'],
  ['StatelessWidget', 'A widget that does not maintain mutable state.'],
  ['StatefulWidget', 'A widget that maintains mutable state.'],
  ['State', 'The mutable state for a StatefulWidget.'],
  ['BuildContext', 'A handle to the location of a widget in the tree.'],
  ['MaterialApp', 'A Material Design application shell.'],
  ['MaterialApp.router', 'A Material application shell driven by a Router.'],
  ['Scaffold', 'A Material screen scaffold with app bar, body, and FAB slots.'],
  ['AppBar', 'A Material top app bar.'],
  ['Text', 'A widget that displays styled text.'],
  ['RichText', 'A widget that displays spans of styled text.'],
  ['Icon', 'A widget that displays an icon.'],
  ['Image', 'A widget that displays an image.'],
  ['IconButton', 'A Material icon button.'],
  ['ElevatedButton', 'A Material elevated button.'],
  ['FilledButton', 'A Material filled button.'],
  ['OutlinedButton', 'A Material outlined button.'],
  ['TextButton', 'A Material text button.'],
  ['FloatingActionButton', 'A Material floating action button.'],
  ['Column', 'A vertical layout of children.'],
  ['Row', 'A horizontal layout of children.'],
  ['Stack', 'A depth-ordered layout of children.'],
  ['Container', 'A convenience widget combining common painting and layout.'],
  ['Padding', 'Insets a child by the given padding.'],
  ['Center', 'Centers a child within itself.'],
  ['Align', 'Aligns a child within itself.'],
  ['Expanded', 'A flexible child that fills available space.'],
  ['Flexible', 'A child with flexible layout constraints.'],
  ['SizedBox', 'A box with a fixed size.'],
  ['Spacer', 'A flexible empty space in a Flex.'],
  ['Divider', 'A horizontal or vertical divider.'],
  ['SafeArea', 'Insets a child to avoid system intrusions.'],
  ['ScrollView', 'A scrollable area.'],
  ['SingleChildScrollView', 'A scrollable view with one child.'],
  ['ListView', 'A scrollable linear list.'],
  ['GridView', 'A scrollable grid.'],
  ['CustomScrollView', 'A scroll view driven by slivers.'],
  ['SliverList', 'A sliver that lays out a linear list.'],
  ['Card', 'A Material card.'],
  ['ListTile', 'A fixed-height Material list row.'],
  ['TextField', 'A Material text input.'],
  ['TextFormField', 'A FormField wrapper around TextField.'],
  ['Form', 'A container for validating form fields.'],
  ['Checkbox', 'A Material checkbox.'],
  ['Switch', 'A Material toggle switch.'],
  ['Slider', 'A Material slider.'],
  ['DropdownButton', 'A Material dropdown selector.'],
  ['NavigationBar', 'A Material 3 bottom navigation bar.'],
  ['BottomNavigationBar', 'A Material bottom navigation bar.'],
  ['Drawer', 'A Material navigation drawer.'],
  ['TabBar', 'A Material tab bar.'],
  ['TabBarView', 'The page view paired with a TabBar.'],
  ['DefaultTabController', 'Provides tab state to descendants.'],
  ['Theme', 'Reads the nearest ThemeData.'],
  ['ThemeData', 'Material theme configuration.'],
  ['MediaQuery', 'Reads the current media metrics.'],
  ['FutureBuilder', 'Builds from the state of a Future.'],
  ['StreamBuilder', 'Builds from the state of a Stream.'],
  ['AnimatedContainer', 'A Container that animates property changes.'],
  ['Hero', 'Animates a widget between routes.'],
  ['Navigator', 'Manages a stack of routes.'],
  ['SnackBar', 'A transient Material message.'],
  ['ScaffoldMessenger', 'Shows SnackBars and other scaffold messages.'],
  ['CircularProgressIndicator', 'A Material circular progress indicator.'],
  ['LinearProgressIndicator', 'A Material linear progress indicator.'],
  ['CupertinoApp', 'A Cupertino application shell.'],
  ['CupertinoPageScaffold', 'A Cupertino screen scaffold.'],
  ['CupertinoButton', 'A Cupertino button.'],
  ['CupertinoNavigationBar', 'A Cupertino top navigation bar.'],
  ['EdgeInsets', 'Immutable padding values.'],
  ['Alignment', 'A point within a rectangle.'],
  ['MainAxisAlignment', 'Main-axis alignment for Flex.'],
  ['CrossAxisAlignment', 'Cross-axis alignment for Flex.'],
  ['BoxDecoration', 'A decoration for boxes.'],
  ['TextStyle', 'Text style configuration.'],
  ['Color', 'A 32-bit color value.'],
  ['Colors', 'Material color palette.'],
  ['NetworkImage', 'Loads an image from the network.'],
  ['AssetImage', 'Loads an image from the asset bundle.']
];

const ANNOTATIONS = [
  ['override', 'Marks an override of a superclass member.'],
  ['required', 'Requires a named parameter.'],
  ['immutable', 'Marks a class as immutable.'],
  ['mustCallSuper', 'Requires subclasses to call super.'],
  ['protected', 'Restricts a member to subclasses.'],
  ['visibleForTesting', 'Marks a member as visible for tests.'],
  ['deprecated', 'Marks a declaration as deprecated.'],
  ['Deprecated', 'Marks a declaration as deprecated with a message.'],
  ['pragma', 'Compiler hint for a declaration.'],
  ['JsonKey', 'Customizes JSON serialization for a field.'],
  ['JsonSerializable', 'Generates JSON serialization code.'],
  ['freezed', 'Generates immutable data classes.'],
  ['riverpod', 'Declares a Riverpod provider.']
];

const MEMBERS = [
  ['build', 'Widget build(BuildContext context)', 'Builds the widget subtree.', 'build()'],
  ['createState', 'State createState()', 'Creates the mutable state for a StatefulWidget.', 'createState()'],
  ['initState', 'void initState()', 'Runs once when the State is inserted.', 'initState()'],
  ['dispose', 'void dispose()', 'Releases resources when the State is removed.', 'dispose()'],
  ['didChangeDependencies', 'void didChangeDependencies()', 'Runs when dependencies change.', 'didChangeDependencies()'],
  ['didUpdateWidget', 'void didUpdateWidget(covariant StatefulWidget oldWidget)', 'Runs when the widget configuration changes.', 'didUpdateWidget()'],
  ['setState', 'void setState(VoidCallback fn)', 'Schedules a rebuild after mutating state.', 'setState()'],
  ['context', 'The BuildContext for this State.', 'context'],
  ['widget', 'The current widget configuration.', 'widget'],
  ['mounted', 'Whether the State is currently mounted.', 'mounted'],
  ['key', 'The widget identity key.', 'key'],
  ['push', 'Future<T?> push<T>(Route<T> route)', 'Pushes a route onto the Navigator.', 'push()'],
  ['pop', 'void pop<T>([T? result])', 'Pops the current route.', 'pop()'],
  ['pushNamed', 'Future<T?> pushNamed<T>(String routeName)', 'Pushes a named route.', 'pushNamed()'],
  ['of', 'Looks up an inherited widget.', 'of()'],
  ['length', 'The number of elements or characters.', 'length'],
  ['isEmpty', 'Whether the collection is empty.', 'isEmpty'],
  ['isNotEmpty', 'Whether the collection has elements.', 'isNotEmpty'],
  ['add', 'Adds one element.', 'add()'],
  ['addAll', 'Adds all elements.', 'addAll()'],
  ['remove', 'Removes one element.', 'remove()'],
  ['removeAt', 'Removes the element at an index.', 'removeAt()'],
  ['contains', 'Whether an element is present.', 'contains()'],
  ['forEach', 'Calls a function for each element.', 'forEach()'],
  ['map', 'Transforms each element.', 'map()'],
  ['where', 'Filters elements.', 'where()'],
  ['firstWhere', 'Finds the first matching element.', 'firstWhere()'],
  ['any', 'Whether any element matches.', 'any()'],
  ['every', 'Whether all elements match.', 'every()'],
  ['reduce', 'Combines elements into one value.', 'reduce()'],
  ['fold', 'Combines elements with an initial value.', 'fold()'],
  ['sort', 'Sorts the list in place.', 'sort()'],
  ['join', 'Joins elements into a string.', 'join()'],
  ['split', 'Splits a string.', 'split()'],
  ['trim', 'Trims surrounding whitespace.', 'trim()'],
  ['toUpperCase', 'Returns an uppercase string.', 'toUpperCase()'],
  ['toLowerCase', 'Returns a lowercase string.', 'toLowerCase()'],
  ['substring', 'Returns a substring.', 'substring()'],
  ['replaceAll', 'Replaces all matches.', 'replaceAll()'],
  ['then', 'Chains a Future completion.', 'then()'],
  ['catchError', 'Handles a Future error.', 'catchError()'],
  ['whenComplete', 'Runs after a Future settles.', 'whenComplete()'],
  ['timeout', 'Fails if a Future does not complete in time.', 'timeout()'],
  ['toString', 'Returns a string representation.', 'toString()']
];

// Types and lookup-only classes that do not have a useful public zero-argument constructor.
const NON_CONSTRUCTIBLE = new Set([
  'Widget', 'State', 'BuildContext', 'Theme', 'MediaQuery', 'Navigator', 'Colors',
  'MainAxisAlignment', 'CrossAxisAlignment'
]);

const WIDGET_MEMBERS = [
  ['padding', 'Adds padding around a widget.', 'padding()'],
  ['margin', 'Adds margin around a widget.', 'margin()'],
  ['width', 'Sets a fixed width.', 'width'],
  ['height', 'Sets a fixed height.', 'height'],
  ['color', 'Sets a color.', 'color'],
  ['child', 'The child widget slot.', 'child'],
  ['children', 'The child widget list.', 'children'],
  ['onPressed', 'The button press callback.', 'onPressed'],
  ['style', 'The widget style.', 'style'],
  ['decoration', 'The box decoration.', 'decoration'],
  ['alignment', 'The child alignment.', 'alignment'],
  ['mainAxisAlignment', 'Main-axis alignment.', 'mainAxisAlignment'],
  ['crossAxisAlignment', 'Cross-axis alignment.', 'crossAxisAlignment']
];

function item(label, detail, documentation, insertText) {
  return { label, detail, documentation, insertText: insertText || label };
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

function moduleInsert(label, typed) {
  // The editor replaces only the trailing identifier. If the user already typed a
  // `package:`/`dart:` prefix or a path segment, insert only the remainder.
  const separatorIndex = Math.max(typed.lastIndexOf(':'), typed.lastIndexOf('/'));
  if (separatorIndex < 0) return label;
  const separator = typed[separatorIndex];
  const labelIndex = label.lastIndexOf(separator);
  return labelIndex >= 0 ? label.slice(labelIndex + 1) : label;
}

function moduleItems(line, prefix) {
  const quoted = line.match(/(['"])([^'"]*)$/);
  const typed = quoted ? quoted[2] : prefix;
  const needle = typed.toLowerCase();
  return MODULES
    .filter(([label]) => label.toLowerCase().startsWith(needle))
    .map(([label, doc]) => item(label, 'package', doc, moduleInsert(label, typed)));
}

function complete(params) {
  const text = typeof params.text === 'string' ? params.text : '';
  const offset = Math.max(0, Math.min(Number(params.offset) || 0, text.length));
  const before = text.slice(0, offset);
  const lineStart = before.lastIndexOf('\n') + 1;
  const line = before.slice(lineStart);
  const prefix = wordPrefix(before);

  if (/^\s*(import|export|part)\b/.test(line)) {
    return moduleItems(line, prefix);
  }
  if (/(?:^|[\s(])@[A-Za-z0-9_]*$/.test(line)) {
    return filterItems(
      ANNOTATIONS.map(([label, doc]) => item(label, '@' + label, doc, label)),
      prefix
    );
  }

  // Any trailing member access (including chained widget calls and Dart cascades),
  // but not a decimal number such as `1.0`.
  if (/\.([A-Za-z0-9_]*)$/.test(before) && !/\b\d+\.\d*$/.test(before)) {
    return filterItems([
      ...MEMBERS.map(([label, detail, doc, insert]) => item(label, detail, doc, insert)),
      ...WIDGET_MEMBERS.map(([label, doc, insert]) => item(label, 'property', doc, insert))
    ], prefix);
  }

  return filterItems([
    ...KEYWORDS.map(label => item(label, 'keyword', 'Dart keyword.', label)),
    ...TYPES.map(([label, doc]) => item(label, 'type', doc, label)),
    ...FUNCTIONS.map(([label, detail, doc, insert]) => item(label, detail, doc, insert)),
    ...WIDGETS.map(([label, doc]) => item(
      label,
      'Flutter widget',
      doc,
      NON_CONSTRUCTIBLE.has(label) ? label : label + '()'
    )),
    ...ANNOTATIONS.map(([label, doc]) => item(label, '@' + label, doc, label)),
    ...MEMBERS.map(([label, detail, doc, insert]) => item(label, detail, doc, insert))
  ], prefix);
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
