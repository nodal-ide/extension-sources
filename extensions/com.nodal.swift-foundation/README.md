# Swift Foundation

Swift completion for Nodal IDE, provided by the `com.nodal.swift-foundation` language provider.

## What this pack contributes

- Completion for Swift declarations, standard-library types and functions, common collection
  members, SwiftUI views/modifiers, property wrappers, attributes, compiler directives, and import
  module names.
- Signature-ish detail and short documentation in the completion popup.
- Context-sensitive completion after `.`, `@`, and `#`, plus the standard manual completion shortcut
  (`⌃Space`).

## Syntax highlighting

Swift syntax highlighting is **built into Nodal IDE** through the bundled Swift tree-sitter grammar
and queries. Extension syntax IDs intentionally cannot shadow a built-in language, so this pack does
not ship a duplicate Swift grammar. It adds completion on top of the built-in highlighting.

## Requirements

- Node.js available as `node` on `PATH` (the provider is dependency-free and uses only the standard
  library).
- Nodal IDE 0.22.0 or later.

## Install

1. Open **Extensions → Add from Folder…**.
2. Select this directory (`com.nodal.swift-foundation`).
3. Open a `.swift` file and start typing, or press `⌃Space` to open completion.

This pack is data/process-only: it does not request workspace access, native grammar loading, or
network access.
