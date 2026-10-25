# Vue Syntax Sample

This is a global language-extension pack. It requires a native grammar library and explicit trust
in Nodal IDE. The local sample includes an Apple Silicon build; rebuild it for other architectures.

The sample grammar sources used during validation were fetched from
[`tree-sitter-grammars/tree-sitter-vue`](https://github.com/tree-sitter-grammars/tree-sitter-vue)
at `ce8011a414fdf8091f4e4071752efc376f4afb08` (MIT). To rebuild, compile that source for the
current Mac architecture and replace `grammars/libtree-sitter-vue.dylib`.

Install it from **Extensions → Add from Folder…**, open its detail, press **Trust…**, then open a
`.vue` file. The sample covers template markup and interpolations plus JavaScript, TypeScript
(`lang="ts"`), CSS, and SCSS script/style zones. Disable or remove the extension to return open
documents to the built-in catalog.
