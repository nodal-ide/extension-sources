; Svelte markup and control-flow highlighting.
; Embedded script/style zones are highlighted through injections.scm.

(comment) @comment
(doctype) @comment

(tag_name) @tag
(attribute_name) @property
(attribute_value) @string
(quoted_attribute_value) @string
(entity) @constant

(raw_text) @none

(snippet_name) @function

[
  "as"
  "const"
  "debug"
  "else"
  "html"
  "if"
  "key"
  "render"
  "snippet"
  "then"
] @keyword

[
  "await"
  "catch"
  "each"
] @repeat

[
  "#"
  ":"
  "/"
  "@"
  "{"
  "}"
] @operator
