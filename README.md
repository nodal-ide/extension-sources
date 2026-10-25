# Nodal IDE Language Extensions

A **language extension** (or *language pack*) adds framework/library knowledge to Nodal IDE — symbols,
signatures, documentation, completion and go-to-definition — **without code**. A pack is a folder with
an `extension.json` manifest and one or more JSON symbol files.

Local, unpublished samples live here:

- `laravel-pack/` — activates via Composer (`laravel/framework`).
- `wordpress-pack/` — activates **without** Composer, via a literal marker file (`wp-config.php`).
- `geojson-pack/` — a query-only **syntax** pack: adds the `geojson` language on top of the built-in
  JSON grammar (see *Syntax highlighting* below).
- `com.nodal.swift-foundation/` — **Swift Foundation**: provider-based completion for the built-in
  Swift syntax and highlighting.
- `com.nodal.svelte-foundation/` — **Svelte Foundation**: native Svelte grammar, embedded
  script/style zones, and markup/script/style completion.
- `com.nodal.vue-foundation/` — **Vue Foundation**: native Vue grammar with template/directive/
  interpolation highlighting and embedded script/style zones.
- `com.nodal.flutter-foundation/` — **Dart & Flutter Foundation**: provider-based completion for the
  built-in Dart syntax and highlighting.
- `com.nodal.forge-pack/`, `vue-pack/` — older native grammar syntax samples. The foundation packs
  supersede them; install only one pack per language. These sample binaries are built for Apple
  Silicon and remain outside the app repository.

The JSON schema is currently published in the `CodeEditLang` dependency repository:

`https://raw.githubusercontent.com/nodal-ide/CodeEditLang/master/Schema/language-extension.schema.json`

Add `"$schema"` to `extension.json` to get editor validation/autocomplete (the authoring tools and
samples include it):

```json
{ "$schema": "https://raw.githubusercontent.com/nodal-ide/CodeEditLang/master/Schema/language-extension.schema.json" }
```

## Create a pack

The authoring tool ships in the `CodeEditLang` package:

```sh
cd codeedit-deps/CodeEditLang
swift run codeedit-ext init MyPack --id com.example.mypack --name "My Pack" --language php
```

That creates:

```
MyPack/
├── extension.json
├── symbols/symbols.json
└── README.md
```

## Validate & pack

```sh
swift run codeedit-ext validate MyPack
swift run codeedit-ext validate --allow-native-grammars MyNativePack
swift run codeedit-ext pack MyPack            # -> MyPack.zip
swift run codeedit-ext schema                 # print the JSON schema
```

`--allow-native-grammars` performs the structural native-grammar checks (path, symbol, SHA-256
format) without loading the binary; the app still performs consent and query compilation on install.

Install the resulting `.zip` in the app via **Extensions ▸ Open Extensions Window ▸ + ▸ Add from
Archive…**.

## Manifest (`extension.json`)

| Key | Required | Notes |
|---|---|---|
| `id` | ✅ | Reverse-DNS id, e.g. `com.example.pack`. |
| `name` | ✅ | Display name. |
| `version` | | Semver string. |
| `type` | | `languagePack` (default). |
| `description` | | Shown in the Extensions window. |
| `author` / `url` | | Shown in the Extensions window. |
| `icon` | | Path to an image in the pack; a default symbol is used otherwise. |
| `languages` | | Languages the pack serves, e.g. `["php"]`. |
| `framework` | | Framework id, e.g. `laravel/framework`. |
| `activation.files` | | **Literal** workspace paths that activate the pack (`wp-config.php`, `artisan`, …). Wildcards are ignored. |
| `activation.framework` | | `{ "file": "composer.json", "requires": { "laravel/framework": ">=9" } }`. |
| `contributes.symbols` | | Paths to symbol JSON files. |
| `contributes.syntax` | | Syntax packs: adds a language on top of a bundled grammar or a native grammar the pack ships. Requires `schemaVersion: 2`. |

## Symbols (`symbols/*.json`)

```json
{
  "language": "php",
  "framework": { "name": "laravel/framework" },
  "symbols": [
    {
      "name": "route",
      "kind": "function",
      "signature": "function route(string $name, mixed $parameters = [], bool $absolute = true): string",
      "parameters": ["string $name", "mixed $parameters = []", "bool $absolute = true"],
      "documentation": "Generate a URL to a named route.",
      "insertText": "route('$1')"
    },
    { "name": "Str", "kind": "class", "namespace": "Illuminate\\Support", "documentation": "String helpers." }
  ]
}
```

- `kind`: `class`, `trait`, `interface`, `enum`, `function`, `method`, `property`, `constant`,
  `variable`, `namespace`.
- **Global helper functions** (`route`, `view`, `component`, …): omit `namespace` so they complete
  unqualified.
- Namespaced classes: add `namespace` and `container` (for members) — they complete after a `use`.

Go-to-definition jumps to a generated reference sheet built from the symbols (no real stubs needed).

## Syntax highlighting (query-only packs)

A pack can add a **new language** without shipping a parser, by reusing a grammar that is already
bundled with Nodal IDE and providing its own tree-sitter queries. This needs `schemaVersion: 2` and
the `syntax` capability:

```json
{
  "schemaVersion": 2,
  "capabilities": ["syntax"],
  "contributes": {
    "syntax": [
      {
        "id": "geojson",
        "displayName": "GeoJSON",
        "extensions": ["geojson"],
        "firstLinePatterns": ["^\\s*\\{\\s*\"type\""],
        "grammar": { "kind": "builtin", "name": "json" },
        "queries": { "highlights": "queries/highlights.scm" }
      }
    ]
  }
}
```

| Key | Required | Notes |
|---|---|---|
| `id` | ✅ | The new language id. Must not collide with a built-in or another pack. |
| `displayName` | | Shown in the inspector; the `id` otherwise. |
| `extensions` / `filenames` | | Detection keys, e.g. `["geojson"]`. They must not shadow a built-in mapping. |
| `firstLinePatterns` | | Regexes tried after extension/filename/shebang detection. |
| `aliases` / `shebangs` | | Extra identifiers and shebang names for the language. |
| `grammar` | ✅ | `{ "kind": "builtin", "name": "<bundled grammar>" }`, or `{ "kind": "native", … }` (global packs only, see *Native grammars*). |
| `queries.highlights` | ✅ | Pack-relative path to a `.scm` query. Every declared query must exist inside the pack. |

The `highlights` query **replaces** the built-in one for that language, so a pack reusing the JSON
grammar has to include the generic JSON rules itself (ordered after any language-specific rules —
earlier captures win). `queries` also accepts `injections`, `folds`, `indents`, `locals`, `tags` and
`parent`, which are merged into the highlights query at runtime.

Install the pack and the language appears in the File Inspector (grouped under **Extensions**, with
the contributing pack's name and version). See `geojson-pack/` for a complete example. Validate with
`codeedit-ext validate`; broken paths, duplicate ids, extension conflicts and malformed queries are
reported there and in the Extensions window.

## Native grammars

A pack that needs a parser Nodal IDE does not bundle (Svelte, Vue, …) can ship its own tree-sitter
grammar as a `.dylib` and declare it instead of a bundled one:

```json
{
  "schemaVersion": 2,
  "type": "nativeSyntaxPack",
  "capabilities": ["syntax", "nativeGrammars"],
  "contributes": {
    "syntax": [
      {
        "id": "svelte",
        "displayName": "Svelte",
        "extensions": ["svelte"],
        "grammar": {
          "kind": "native",
          "path": "grammars/libtree-sitter-svelte.dylib",
          "symbol": "tree_sitter_svelte",
          "sha256": "<64 lowercase hex characters, optional>"
        },
        "queries": { "highlights": "queries/highlights.scm" }
      }
    ]
  }
}
```

| Key | Required | Notes |
|---|---|---|
| `path` | ✅ | Pack-relative path to a single-architecture or universal `.dylib`. |
| `symbol` | ✅ | The exported `tree_sitter_*` entry point. |
| `sha256` | | The hash the author publishes for the binary. |

Native grammars are an explicit trust boundary, **not** a sandbox:

- **Global packs only.** A pack in a workspace's `.codeedit/extensions` may not declare one; it is
  rejected with an error. Always install a native pack through the Extensions window.
- **Consent first.** A native grammar is never loaded until you press **Trust…** for it in the
  extension's detail view. An untrusted pack contributes no language and reports why.
- **Pinned to the approved bytes.** Trusting records the SHA-256 of the grammar as it is on disk. If
  the file changes afterwards the load fails, the language stays registered, and highlighting falls
  back to plain text with the reason shown in the Extensions window.
- **Validated before loading.** The app checks path containment, regular-file status, no symlink
  escape, a slice for this Mac's architecture, a resolvable tree-sitter runtime dependency, the
  exported symbol and external-scanner symbols, and a compatible tree-sitter ABI.
- **Loaded on demand.** Catalog discovery does not load native code. Opening the pack's detail validates
  it; opening a document using the language loads its grammar on first use.

The Extensions window has separate default-on switches for syntax packs and native grammars. Turning
syntax packs off restores built-in language behavior. Turning native grammars off prevents new native
loads; restart Nodal IDE to unload libraries already loaded in the current process. The Svelte and Vue
sample directories include the source license and setup notes; install them globally and trust them
from their detail view before opening a sample document.

## Activation

A pack is active when **any** of:

1. The project declares it in `.codeedit/settings.json` → `project.frameworks` (Workspace Settings ▸
   Languages). This is authoritative and never scans the project.
2. `activation.framework` matches the marker file (`composer.json`) requirement.
3. `activation.files` lists a literal marker file that exists in the workspace.

A pack with no `activation` block applies whenever its `languages` match.

## Programmatic providers (advanced)

Instead of data-only symbols, an extension can contribute **code**: a program run out-of-process and
spoken to over **JSON-RPC 2.0 on stdio** (so you can write it in any language). See
`example-provider/` for a dependency-free Node sample.

```json
{
  "type": "languageProvider",
  "languages": ["php"],
  "contributes": {
    "provider": {
      "command": "node",
      "args": ["provider.js"],
      "languages": ["php"],
      "completionTriggers": ["\\", ">", ":"]
    }
  }
}
```

`command`: a path resolved relative to the pack root, or a bare name looked up on `PATH`. The process
is started lazily on first use, per workspace, and is sent newline-delimited JSON requests.

`completionTriggers` is an optional array of single-character triggers. Omitting it keeps the legacy
set (`\`, `>`, `:`); supplying an array replaces it; an empty array leaves completion to the manual
shortcut. The validator rejects whitespace, multi-character, duplicate, and oversized trigger lists.

| Method | Params | Result |
|---|---|---|
| `initialize` | `{}` | `{ "capabilities": [...] }` |
| `completion` | `{ file, language, offset, text }` | `[{ label, detail?, documentation?, insertText? }]` |
| `hover` | `{ file, offset, text }` | `{ contents }` or `null` |
| `definition` | `{ file, offset, text }` | `[{ file?, location, length? }]` |
| `signatureHelp` | `{ file, offset, argumentIndex, text }` | `{ signature, parameters?, activeParameter? }` or `null` |
| `diagnostics` | `{ file, text }` | `[{ location, length?, severity?, message, line? }]` |
| `documentSymbols` | `{ file, text }` | `[{ name, detail?, location }]` |
| `codeActions` | `{ file, location, length }` | `[{ title, kind?, edits: [{ location, length, text }] }]` |
| `shutdown` | `{}` | `null` |

Offsets are UTF-16 offsets (matching the editor). Every request carries an `id`; reply with
`{ "jsonrpc": "2.0", "id": <id>, "result": ... }` (or an `error`). Provider output takes priority
over the built-in engine for its language.

## Knowledge bases

An extension can also ship **offline documentation**, shown in the app's **Knowledge Base**
(Help ▸ Knowledge Base, ⌘⇧K). Add a folder of Markdown/HTML pages with an `index.json` and reference
it from the manifest:

```json
{
  "contributes": {
    "knowledge": [
      { "id": "mypack", "title": "My Pack Docs", "root": "knowledge", "index": "index.json" }
    ]
  }
}
```

`knowledge/index.json`:

```json
{
  "title": "My Pack",
  "subtitle": "Reference",
  "home": "Home.md",
  "toc": [
    { "title": "Home", "path": "Home.md" },
    { "title": "Guides", "children": [ { "title": "Setup", "path": "Guides/Setup.md" } ] }
  ]
}
```

See `laravel-pack/knowledge/` for a working sample. Pages link with ordinary relative Markdown links.


