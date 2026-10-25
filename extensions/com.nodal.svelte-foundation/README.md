# Svelte Foundation

Svelte language support for Nodal IDE: native syntax highlighting, embedded script/style zones, and
context-aware completion.

## What this pack contributes

- A native tree-sitter Svelte grammar (`tree_sitter_svelte`) with the highlight and injection queries
  used by the editor.
- Embedded zones for `<script>` (JavaScript, TypeScript via `lang="ts"`) and `<style>` (CSS, SCSS via
  `lang="scss"`).
- Completion for:
  - Svelte directives such as `on:`, `bind:`, `class:`, `style:`, `use:`, `transition:`, `in:`,
    `out:`, `animate:`, and `let:`.
  - Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`, `$bindable`, `$inspect`, `$host`).
  - Blocks and special tags (`#if`, `#each`, `#await`, `#key`, `#snippet`, `:else`, `:then`,
    `:catch`, `@html`, `@debug`, `@const`, `@render`).
  - Lifecycle, store, transition, easing, and module APIs.
  - JavaScript/TypeScript keywords, globals, members, and import modules inside `<script>`.
  - Common CSS properties inside `<style>` and in `style:` directives.

## Syntax highlighting

The pack ships the Svelte grammar as an Apple Silicon `.dylib`. It is pinned by SHA-256 in
`extension.json`; the manifest will reject a different binary after trust.

Grammar source: [`tree-sitter-grammars/tree-sitter-svelte`](https://github.com/tree-sitter-grammars/tree-sitter-svelte)
at `ae5199db47757f785e43a14b332118a5474de1a2` (MIT). The bundled binary is a local Apple Silicon
build. To support another architecture, rebuild that source as a universal or arch-specific `.dylib`
and update the `sha256` field.

## Requirements

- Node.js available as `node` on `PATH` for completion (the provider has no dependencies).
- Nodal IDE 0.22.0 or later.
- Native grammars enabled in **Settings → Extensions**.

## Install

1. Open **Extensions → Add from Folder…** and select this directory.
2. Open the extension detail and press **Trust…** for the native grammar.
3. Open a `.svelte` file; syntax highlighting is active immediately and completion follows typing or
   `⌃Space`.

Because this is a native grammar pack it must be installed globally, not from a workspace
`.codeedit/extensions` folder.

> Do not install this pack alongside `com.nodal.forge-pack`; both contribute the `svelte` language
> id and the first enabled pack wins. The foundation pack supersedes the older sample.
