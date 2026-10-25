# Dart & Flutter Foundation

Dart and Flutter completion for Nodal IDE, provided by the `com.nodal.flutter-foundation` language
provider.

## What this pack contributes

- Completion for Dart keywords, core types, common functions, collection/Future members, and imports.
- Completion for Flutter/Material/Cupertino widgets, widget properties, navigation, dialogs, theming,
  and common state-management package imports.
- Context-aware completion after `.` and `@`, plus import/export/part module completion.
- Completion triggers: `.`, `:`, and `@`; manual completion is always available with `⌃Space`.

## Syntax highlighting

Dart syntax highlighting is **built into Nodal IDE** through the bundled Dart tree-sitter grammar and
queries. Extension syntax IDs cannot shadow built-in languages, so this pack does not ship a duplicate
Dart grammar. Flutter `.dart` files use the built-in Dart highlighting; this pack adds completion on
top.

## Requirements

- Node.js available as `node` on `PATH` (the provider is dependency-free).
- Nodal IDE 0.22.0 or later.
- No native grammar or workspace access is requested.

## Install

1. Open **Extensions → Add from Folder…** and select this directory.
2. Open a `.dart` file and start typing, or press `⌃Space`.

This pack is data/process-only: it has no native grammar trust step and no network access.
