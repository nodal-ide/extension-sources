# Dart & Flutter Foundation

Dart and Flutter intelligence for Nodal IDE, provided by the `com.nodal.flutter-foundation` language
provider. No analyzer, no network, no workspace access: a catalog of framework APIs plus bounded text
heuristics.

## What this pack contributes

- **Receiver-aware completion.** `Icons.`, `Colors.`, `Colors.red.`, `Theme.of(context).`,
  `Theme.of(context).textTheme.`, `MediaQuery.of(context).`, `Navigator.of(context).`,
  `ScaffoldMessenger.of(context).`, `context.`, `'string'.`, `Future.`, `Duration.`,
  `MainAxisAlignment.`, and more resolve to their own member lists instead of one generic list.
- **Named parameters inside constructors.** Typing `(` after a catalog widget offers its parameters,
  required first, without repeating names already written; `alignment:` then offers `Alignment.*`
  values, and `padding:` leads with `EdgeInsets` constructors.
- **Ranked completion.** Framework API first, then Dart core, then keywords, capped at 200 items with
  `sortText` so the editor keeps the provider's order for equally scored matches.
- **Item kinds and snippets.** Widgets, classes, methods, properties, constants, keywords, modules and
  enum values get distinct icons; constructors insert `Name($1)` with the caret between the
  parentheses.
- **Hover documentation.** Signature, one-line description and origin (`Flutter`, `Dart · core`,
  `Icons`, `Colors`, …), for framework classes, constructors, enum values, statics, members and
  annotations.
- **Signature help.** Catalog callables show their parameters with the active one highlighted.
- **Document symbols.** Classes, mixins, enums, extensions, methods, constructors, top-level functions
  and variables, extracted from comment/string-masked text.
- **Flutter API diagnostics.** `RaisedButton`/`FlatButton`/`OutlineButton`, `WillPopScope`,
  `Color.withOpacity`, and `Container` with both `color:` and `decoration:`.
- **Import completion** for `dart:` and `package:` libraries, and annotation completion after `@`.

## Triggers

`.`, `:`, `@` and `(` open completion automatically; `⌃Space` is always available. `(` is what makes
named-parameter completion appear; when the callee is not in the catalog the pack returns nothing
rather than a guess.

## Catalog

Baseline: **Flutter 3.24 / Dart 3.5** stable.

| Table | Entries |
| --- | --- |
| Framework symbols (widgets, classes, mixins, enums, typedefs, constructors, functions) | 434 |
| Dart core types / functions | 55 / 15 |
| Keywords | 63 |
| Icons | 267 |
| Material colors | 52 (+ shades) |
| Enum types with values | 48 |
| Modules | 46 |
| Annotations | 14 |
| Diagnostic rules | 3 (+1 structural) |

`node tools/build.js` validates the data (duplicate names, missing docs, malformed parameters, enum
coverage) and prints the table above.

## Limits

These are deliberate; the pack is text-level only.

- **No type inference.** `final theme = Theme.of(context);` followed by `theme.` falls back to the
  generic member list. Only direct chains resolve.
- **No analyzer.** No generics resolution, no extension methods, no cross-file symbols. Heuristics can
  misfire; every unknown case degrades to the generic list or to nothing.
- **No go-to-definition.** The host asks extensions before a language server, so a definition stub
  from this pack would hide a real Dart LSP's answer. Install a Dart LSP for definitions and the
  analyzer's hover; this pack stays additive for completion.
- **Hover shadows a Dart LSP for catalog symbols.** Routing stops at the first answer, and extensions
  outrank language servers, so hover on a shipped framework name shows this pack's text. Hover on
  anything outside the catalog (your own classes) returns nothing and falls through to the LSP.
- **No quick fixes.** The host's `codeActions` request carries a range but no document text, so a
  provider cannot compute a safe edit for it. Diagnostics are inline-only.
- **No auto-import.** Completion items have no additional edits in the provider protocol.
- **Diagnostics are inline only**, gated on `package:flutter/`, skipped for files over 500 KB and for
  `.g.dart` / `.freezed.dart` / `.gr.dart` / `.mapper.dart`, and suppressed when the file declares a
  type of the same name.
- **Completion is suppressed inside strings and comments**, where a widget list would only be
  noise.
- **The returned list is capped at 200 items.** The editor filters that snapshot instantly and
  re-requests after a short debounce, so typing narrows the list rather than freezing it.

## Performance

Measured on a generated 229 KB Dart file (`node test/run.js`): completion median **0.4 ms**, p95
**0.8 ms** end to end over stdio. Completion never scans the whole document; document-wide work
(symbols, diagnostics) runs only on its own debounced request and masks the text once per change.

## Layout

```
extension.json        manifest (v0.3.0)
provider.js           JSON-RPC transport and dispatch
lib/text.js           prefix, balanced-paren scan, masking, hashing
lib/catalog.js        lookup tables built once from data/
lib/resolve.js        receiver and call-target resolution
lib/completion.js     context routing, ranking, 200-item cap
lib/hover.js          hover text and signature help
lib/symbols.js        declaration scan
lib/diagnostics.js    rule engine over masked text
data/                 catalog tables (no code)
tools/build.js        data validator
test/run.js           harness that spawns provider.js like the host
```

## Testing

```sh
node tools/build.js   # data integrity and coverage
node test/run.js      # protocol, contexts, hover, symbols, diagnostics, performance
```

Both are dependency-free and need only `node`.

## Requirements

- Node.js available as `node` on `PATH` (the provider is dependency-free).
- Nodal IDE 0.22.0 or later.
- No native grammar or workspace access is requested. Dart syntax highlighting is built into Nodal;
  extension syntax IDs cannot shadow built-in languages, so this pack ships no grammar.

## Install

1. Open **Extensions → Add from Folder…** and select this directory.
2. Open a `.dart` file and start typing, or press `⌃Space`.

## Changelog

- **0.3.0** — receiver-aware completion (including named constructors such as `ListView.builder`),
  named-parameter completion, ranked catalog (434 framework symbols), item kinds, snippets, hover,
  signature help, document symbols, Flutter diagnostics, `(` trigger, data validator and protocol
  harness.
- **0.1.0** — initial completion-only provider.
