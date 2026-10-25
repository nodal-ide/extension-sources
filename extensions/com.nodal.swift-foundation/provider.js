#!/usr/bin/env node
//
// Nodal IDE Swift Foundation provider.
//
// Dependency-free JSON-RPC 2.0 over stdin/stdout. Swift syntax highlighting is built into
// Nodal's language catalog; this provider adds completion for Swift, Foundation, and the
// SwiftUI/Combine APIs most editor scripts reach for.
//
// Requests are newline-delimited JSON objects with an `id`; responses echo that `id`.

'use strict';

const MODULES = [
  ['Foundation', 'Apple Foundation framework.'],
  ['SwiftUI', 'Declarative UI framework.'],
  ['Combine', 'Reactive publisher framework.'],
  ['AppKit', 'macOS application and window APIs.'],
  ['Observation', 'Observation macros and tracking.'],
  ['os', 'Logging, signposts, and OS primitives.'],
  ['CoreData', 'Core Data managed object model.'],
  ['CoreGraphics', 'Drawing primitives and geometry.'],
  ['CryptoKit', 'Hashing, encryption, and signatures.'],
  ['MapKit', 'Map views and location APIs.'],
  ['AVFoundation', 'Audio and video capture and playback.'],
  ['Charts', 'Swift Charts.'],
  ['Testing', 'Swift Testing macros and expectations.']
];

const KEYWORDS = [
  'associatedtype', 'borrowing', 'catch', 'class', 'consuming', 'defer', 'deinit',
  'enum', 'extension', 'fallthrough', 'for', 'func', 'guard', 'if', 'import', 'in',
  'indirect', 'init', 'inout', 'let', 'macro', 'nonisolated', 'operator', 'private',
  'fileprivate', 'internal', 'package', 'public', 'open', 'protocol', 'repeat',
  'required', 'rethrows', 'return', 'static', 'struct', 'subscript', 'switch',
  'throw', 'throws', 'try', 'typealias', 'var', 'where', 'while'
];

const DECLARATION_MODIFIERS = [
  'async', 'await', 'convenience', 'dynamic', 'final', 'isolated', 'lazy', 'mutating',
  'nonmutating', 'override', 'sending', 'some', 'any', 'weak', 'unowned', 'unsafe'
];

const TYPES = [
  ['String', 'A Unicode string.'],
  ['Int', 'A signed integer.'],
  ['Double', 'A double-precision floating-point value.'],
  ['Float', 'A single-precision floating-point value.'],
  ['Bool', 'A Boolean value.'],
  ['Character', 'A single Unicode character.'],
  ['Substring', 'A slice of a string.'],
  ['Array', 'An ordered collection.'],
  ['Dictionary', 'A key-value collection.'],
  ['Set', 'An unordered collection of unique values.'],
  ['Optional', 'A value that may be absent.'],
  ['Result', 'The result of a failable operation.'],
  ['Range', 'A half-open range.'],
  ['ClosedRange', 'A closed range.'],
  ['URL', 'A file or network location.'],
  ['Date', 'An absolute point in time.'],
  ['Data', 'A byte buffer.'],
  ['UUID', 'A universally unique identifier.'],
  ['Decimal', 'A base-10 decimal value.'],
  ['Error', 'The protocol for recoverable errors.'],
  ['Codable', 'A type that can be encoded and decoded.'],
  ['Equatable', 'A type whose values can be compared.'],
  ['Hashable', 'A type usable as a dictionary key.'],
  ['Identifiable', 'A type with a stable identity.'],
  ['Sendable', 'A type safe to share across concurrency domains.'],
  ['Any', 'The existential type for any value.'],
  ['AnyObject', 'The existential type for any class instance.'],
  ['Task', 'A unit of asynchronous work.'],
  ['TaskGroup', 'A group of child tasks.'],
  ['AsyncStream', 'An asynchronous sequence.'],
  ['MainActor', 'The main-thread actor.'],
  ['ObservableObject', 'A Combine-observable reference type.'],
  ['Published', 'A Combine publisher for a property.']
];

const FUNCTIONS = [
  ['print', 'func print(_:separator:terminator:)', 'Writes values to standard output.', 'print()'],
  ['debugPrint', 'func debugPrint(_:separator:terminator:)', 'Writes debug output to standard output.', 'debugPrint()'],
  ['fatalError', 'func fatalError(_:file:line:)', 'Stops execution with a fatal error.', 'fatalError()'],
  ['precondition', 'func precondition(_:_:file:line:)', 'Checks a condition in debug and release builds.', 'precondition()'],
  ['assert', 'func assert(_:_:file:line:)', 'Checks a condition in debug builds.', 'assert()'],
  ['min', 'func min<T: Comparable>(_:_:)', 'Returns the lesser of two values.', 'min()'],
  ['max', 'func max<T: Comparable>(_:_:)', 'Returns the greater of two values.', 'max()'],
  ['abs', 'func abs<T: SignedNumeric>(_:)', 'Returns the absolute value.', 'abs()'],
  ['zip', 'func zip<A: Sequence, B: Sequence>(_:_:)', 'Pairs the elements of two sequences.', 'zip()'],
  ['stride', 'func stride(from:to:by:)', 'Produces a sequence of stepped values.', 'stride(from:to:by:)']
];

const SWIFTUI_TYPES = [
  ['View', 'The protocol for a SwiftUI view.'],
  ['Text', 'A view that displays text.'],
  ['Label', 'A view combining an icon and text.'],
  ['Button', 'A control that performs an action.'],
  ['Image', 'A view that displays an image.'],
  ['VStack', 'A vertical stack of views.'],
  ['HStack', 'A horizontal stack of views.'],
  ['ZStack', 'A depth-ordered stack of views.'],
  ['Spacer', 'A flexible space in a stack.'],
  ['Divider', 'A visual separator.'],
  ['Group', 'A container that groups views without affecting layout.'],
  ['List', 'A scrolling list of rows.'],
  ['ForEach', 'A view that repeats content over a collection.'],
  ['Section', 'A labeled section in a list or form.'],
  ['Form', 'A grouped settings-style container.'],
  ['ScrollView', 'A scrollable container.'],
  ['LazyVStack', 'A lazily created vertical stack.'],
  ['LazyHStack', 'A lazily created horizontal stack.'],
  ['NavigationStack', 'A stack-based navigation container.'],
  ['NavigationLink', 'A control that pushes a destination view.'],
  ['Toggle', 'A control that switches a Boolean value.'],
  ['TextField', 'A single-line text input.'],
  ['TextEditor', 'A multi-line text input.'],
  ['Picker', 'A control that chooses among options.'],
  ['GeometryReader', 'A container that exposes its geometry.'],
  ['Sheet', 'A presentation modifier for modal content.'],
  ['Alert', 'A presentation modifier for alerts.']
];

const ATTRIBUTES = [
  ['State', 'Local view state that invalidates the view when changed.'],
  ['Binding', 'A read-write reference to state owned elsewhere.'],
  ['StateObject', 'A reference-type object owned by the view.'],
  ['ObservedObject', 'A reference-type object owned elsewhere.'],
  ['EnvironmentObject', 'An observable object injected through the environment.'],
  ['Environment', 'A value read from the SwiftUI environment.'],
  ['AppStorage', 'A property backed by user defaults.'],
  ['SceneStorage', 'A property backed by scene restoration storage.'],
  ['FocusState', 'Focus state for keyboard and accessibility navigation.'],
  ['ViewBuilder', 'A result builder for composing views.'],
  ['MainActor', 'Isolates the declaration to the main actor.'],
  ['Sendable', 'Marks a type as safe to share across concurrency domains.'],
  ['escaping', 'Marks a closure that outlives the call.'],
  ['autoclosure', 'Wraps an expression in an implicit closure.'],
  ['discardableResult', 'Allows ignoring a function result without a warning.'],
  ['inlinable', 'Exposes a function body to other modules for inlining.'],
  ['frozen', 'Prevents adding stored properties outside the defining module.'],
  ['objc', 'Exposes a declaration to Objective-C.'],
  ['available', 'Constrains availability by platform or version.'],
  ['propertyWrapper', 'Marks a type as a property wrapper.'],
  ['resultBuilder', 'Marks a type as a result builder.'],
  ['dynamicMemberLookup', 'Enables subscript-based dynamic member access.'],
  ['preconcurrency', 'Adopts a concurrency contract from an imported module.']
];

const HASH_DIRECTIVES = [
  ['if', 'Starts a compile-time conditional block.'],
  ['elseif', 'Adds a compile-time conditional branch.'],
  ['else', 'The fallback compile-time conditional branch.'],
  ['endif', 'Ends a compile-time conditional block.'],
  ['available', 'Checks platform availability at runtime.'],
  ['selector', 'Refers to an Objective-C selector.'],
  ['keyPath', 'Refers to a key path.'],
  ['Preview', 'Declares a SwiftUI preview.'],
  ['externalMacro', 'Declares the external implementation of a macro.'],
  ['assert', 'Performs a compile-time assertion.']
];

const MEMBERS = [
  ['map', 'func map<T>(_:) -> [T]', 'Transforms each element.', 'map()'],
  ['compactMap', 'func compactMap<T>(_:) -> [T]', 'Transforms and drops nil results.', 'compactMap()'],
  ['flatMap', 'func flatMap<Segment>(_:) -> [Segment.Element]', 'Flattens transformed elements.', 'flatMap()'],
  ['filter', 'func filter(_:) -> [Element]', 'Keeps elements matching a predicate.', 'filter()'],
  ['reduce', 'func reduce<Result>(_:_:)', 'Combines elements into one value.', 'reduce()'],
  ['forEach', 'func forEach(_:)', 'Calls a closure for each element.', 'forEach()'],
  ['sorted', 'func sorted(by:) -> [Element]', 'Returns the elements in sorted order.', 'sorted()'],
  ['contains', 'func contains(_:) -> Bool', 'Checks whether an element is present.', 'contains()'],
  ['first', 'The first element, if any.', 'first'],
  ['last', 'The last element, if any.', 'last'],
  ['count', 'The number of elements.', 'count'],
  ['isEmpty', 'Whether the collection has no elements.', 'isEmpty'],
  ['append', 'func append(_:)', 'Adds an element to the end.', 'append()'],
  ['insert', 'func insert(_:at:)', 'Inserts an element at an index.', 'insert()'],
  ['remove', 'func remove(at:)', 'Removes the element at an index.', 'remove()'],
  ['removeAll', 'func removeAll(where:)', 'Removes all matching elements.', 'removeAll()'],
  ['lowercased', 'func lowercased() -> String', 'Returns a lowercase copy.', 'lowercased()'],
  ['uppercased', 'func uppercased() -> String', 'Returns an uppercase copy.', 'uppercased()'],
  ['trimmingCharacters', 'func trimmingCharacters(in:) -> String', 'Trims characters from both ends.', 'trimmingCharacters(in: .whitespacesAndNewlines)'],
  ['split', 'func split(separator:maxSplits:omittingEmptySubsequences:)', 'Splits a collection.', 'split(separator: " ")'],
  ['joined', 'func joined(separator:) -> String', 'Joins string elements.', 'joined(separator: " ")'],
  ['description', 'A textual description of the value.', 'description'],
  ['mapError', 'func mapError<E>(_:) -> Result<Success, E>', 'Transforms the failure type.', 'mapError()']
];

const MODIFIERS = [
  ['padding', 'Adds space around a view.', 'padding()'],
  ['frame', 'Constrains a view to a size.', 'frame()'],
  ['foregroundStyle', 'Sets the foreground style.', 'foregroundStyle()'],
  ['background', 'Draws a background behind a view.', 'background()'],
  ['cornerRadius', 'Rounds a view’s corners.', 'cornerRadius()'],
  ['clipShape', 'Clips a view to a shape.', 'clipShape()'],
  ['opacity', 'Adjusts a view’s opacity.', 'opacity()'],
  ['font', 'Sets a view’s font.', 'font()'],
  ['bold', 'Applies a bold font weight.', 'bold()'],
  ['task', 'Runs an asynchronous task when the view appears.', 'task()'],
  ['onAppear', 'Runs an action when the view appears.', 'onAppear()'],
  ['onDisappear', 'Runs an action when the view disappears.', 'onDisappear()'],
  ['onChange', 'Runs an action when a value changes.', 'onChange(of:)'],
  ['sheet', 'Presents a modal sheet.', 'sheet()'],
  ['alert', 'Presents an alert.', 'alert()'],
  ['navigationTitle', 'Sets the navigation title.', 'navigationTitle()'],
  ['toolbar', 'Adds toolbar content.', 'toolbar()'],
  ['disabled', 'Disables user interaction.', 'disabled()'],
  ['accessibilityLabel', 'Sets an accessibility label.', 'accessibilityLabel()']
];

const GENERAL = [
  ...KEYWORDS.map(label => item(label, 'keyword', 'Swift keyword.', label)),
  ...DECLARATION_MODIFIERS.map(label => item(label, 'modifier', 'Swift declaration modifier.', label)),
  ...TYPES.map(([label, doc]) => item(label, 'type', doc, label)),
  ...FUNCTIONS.map(([label, detail, doc, insert]) => item(label, detail, doc, insert)),
  ...SWIFTUI_TYPES.map(([label, doc]) => item(label, 'SwiftUI type', doc, label)),
  ...MEMBERS.map(([label, detail, doc, insert]) => item(label, detail, doc, insert)),
  ...MODIFIERS.map(([label, doc, insert]) => item(label, 'SwiftUI modifier', doc, insert))
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

function complete(params) {
  const text = typeof params.text === 'string' ? params.text : '';
  const offset = Math.max(0, Math.min(Number(params.offset) || 0, text.length));
  const before = text.slice(0, offset);
  const lineStart = before.lastIndexOf('\n') + 1;
  const line = before.slice(lineStart);
  const prefix = wordPrefix(before);

  if (/^\s*import\s+[A-Za-z0-9_]*$/.test(line)) {
    return filterItems(
      MODULES.map(([label, doc]) => item(label, 'module', doc, label)),
      prefix
    );
  }
  if (/(?:^|[\s(])@[A-Za-z0-9_]*$/.test(line)) {
    return filterItems(
      ATTRIBUTES.map(([label, doc]) => item(label, '@' + label, doc, label)),
      prefix
    );
  }
  if (/(?:^|\s)#[A-Za-z0-9_]*$/.test(line)) {
    return filterItems(
      HASH_DIRECTIVES.map(([label, doc]) => item(label, '#' + label, doc, label)),
      prefix
    );
  }

  const member = before.match(/([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/);
  if (member && !/^\d+$/.test(member[1])) {
    return filterItems([
      ...MEMBERS.map(([label, detail, doc, insert]) => item(label, detail, doc, insert)),
      ...MODIFIERS.map(([label, doc, insert]) => item(label, 'SwiftUI modifier', doc, insert))
    ], prefix);
  }

  return filterItems(GENERAL, prefix);
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
