'use strict';

// Metadata annotations: [name, doc, import hint]
module.exports = [
  ['override', 'Marks an override of a superclass member.', ''],
  ['required', 'Requires a named parameter.', ''],
  ['immutable', 'Marks a class as immutable.', 'package:meta/meta.dart'],
  ['mustCallSuper', 'Requires subclasses to call super.', 'package:meta/meta.dart'],
  ['protected', 'Restricts a member to subclasses.', 'package:meta/meta.dart'],
  ['visibleForTesting', 'Marks a member as visible for tests.', 'package:meta/meta.dart'],
  ['visibleForOverriding', 'Marks a member as overridable but not callable.', 'package:meta/meta.dart'],
  ['Deprecated', 'Marks a declaration as deprecated with a message.', ''],
  ['deprecated', 'Marks a declaration as deprecated.', ''],
  ['pragma', 'A compiler hint for a declaration.', ''],
  ['JsonKey', 'Customizes JSON serialization for a field.', 'package:json_annotation/json_annotation.dart'],
  ['JsonSerializable', 'Generates JSON serialization code.', 'package:json_annotation/json_annotation.dart'],
  ['freezed', 'Generates immutable data classes.', 'package:freezed_annotation/freezed_annotation.dart'],
  ['riverpod', 'Declares a Riverpod provider.', 'package:flutter_riverpod/flutter_riverpod.dart']
];
