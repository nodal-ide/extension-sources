((script_element
  (start_tag) @_tag
  (raw_text) @injection.content)
  (#not-match? @_tag "(lang|type)\\s*=")
  (#set! injection.language "javascript"))

((script_element
  (start_tag
    (attribute
      (attribute_name) @_name
      (quoted_attribute_value
        (attribute_value) @_language)))
  (raw_text) @injection.content)
  (#eq? @_name "lang")
  (#any-of? @_language "ts" "typescript")
  (#set! injection.language "typescript"))

((script_element
  (start_tag
    (attribute
      (attribute_name) @_name
      (quoted_attribute_value
        (attribute_value) @_language)))
  (raw_text) @injection.content)
  (#eq? @_name "lang")
  (#eq? @_language "js")
  (#set! injection.language "javascript"))

((style_element
  (start_tag) @_tag
  (raw_text) @injection.content)
  (#not-match? @_tag "lang\\s*=")
  (#set! injection.language "css"))

((style_element
  (start_tag
    (attribute
      (attribute_name) @_name
      (quoted_attribute_value
        (attribute_value) @_language)))
  (raw_text) @injection.content)
  (#eq? @_name "lang")
  (#eq? @_language "scss")
  (#set! injection.language "scss"))

(interpolation
  (raw_text) @injection.content
  (#set! injection.language "javascript"))
