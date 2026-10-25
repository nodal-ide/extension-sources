; GeoJSON syntax highlights.
;
; This is a query-only pack: it adds the `geojson` language on top of the JSON grammar bundled
; with CodeEdit. A contributed highlights query replaces the built-in one for the language it
; defines, so this file is self-contained — the generic JSON rules below stand in for the bundled
; `tree-sitter-json/highlights.scm`.
;
; Ordering matters: the highlighter favors lower-indexed captures, so the GeoJSON-specific rules
; come first and win over the generic key rule for the same node.

; GeoJSON structural keys.
((pair
  key: (string) @property)
  (#any-of? @property
    "\"type\"" "\"coordinates\"" "\"geometry\"" "\"geometries\""
    "\"properties\"" "\"features\"" "\"bbox\""))

; GeoJSON type names (the value of a `"type"` pair).
((pair
  value: (string) @constant)
  (#any-of? @constant
    "\"Point\"" "\"MultiPoint\"" "\"LineString\"" "\"MultiLineString\"" "\"Polygon\""
    "\"MultiPolygon\"" "\"GeometryCollection\"" "\"Feature\"" "\"FeatureCollection\""))

; Generic JSON.
(pair
  key: (_) @string.special.key)

(string) @string

(number) @number

[
  (null)
  (true)
  (false)
] @constant.builtin

(escape_sequence) @escape

(comment) @comment
