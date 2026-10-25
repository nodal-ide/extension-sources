# Vue Foundation

Vue 3 single-file component support for Nodal IDE: native tree-sitter highlighting for template markup,
directives, interpolations, and embedded script/style zones.

## What this pack contributes

- Native Vue grammar (`tree_sitter_vue`) with the highlight and injection queries.
- Template highlighting for tags, attribute names/values, directives and modifiers, and `{{ }}`
  interpolation.
- Embedded zones:
  - `<script>` defaults to JavaScript; `lang="ts"`/`lang="typescript"` use TypeScript.
  - `<style>` defaults to CSS; `lang="scss"` uses SCSS.
  - `{{ expression }}` interpolations are highlighted as JavaScript.
- SHA-256-pinned grammar bytes and the existing native-grammar consent flow.

## Requirements

- Nodal IDE 0.22.0 or later.
- Native grammars enabled in **Settings → Extensions**.
- A global installation. Native grammar packs cannot be installed from a workspace
  `.codeedit/extensions` folder.

## Install

1. Open **Extensions → Add from Folder…** and select this directory.
2. Open the extension detail and press **Trust…** for the native grammar.
3. Open a `.vue` file.

> Do not install this pack alongside `vue-pack`; both contribute the `vue` language id and the first
> enabled pack wins. The foundation pack supersedes the older sample.

## Grammar source

Bundled from [`tree-sitter-grammars/tree-sitter-vue`](https://github.com/tree-sitter-grammars/tree-sitter-vue)
at `ce8011a414fdf8091f4e4071752efc376f4afb08` (MIT). The included binary is an Apple Silicon build.
Rebuild the grammar for other architectures and update the `sha256` field when replacing it.
