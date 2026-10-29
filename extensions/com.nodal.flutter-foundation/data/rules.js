'use strict';

// Diagnostic rules. Each rule runs over comment/string-masked text.
// `pattern` must be global and match the exact API shape to report.

module.exports = [
  {
    id: 'removed-widget',
    severity: 'warning',
    pattern: /\b(RaisedButton|FlatButton|OutlineButton)\b/g,
    message: match => `${match} was removed in Flutter 3.0 — use ${{
      RaisedButton: 'ElevatedButton',
      FlatButton: 'TextButton',
      OutlineButton: 'OutlinedButton'
    }[match]}.`,
    length: match => match.length
  },
  {
    id: 'removed-willpopscope',
    severity: 'warning',
    pattern: /\bWillPopScope\b/g,
    message: () => 'WillPopScope was removed — use PopScope with canPop and onPopInvokedWithResult.',
    length: match => match.length
  },
  {
    id: 'deprecated-with-opacity',
    severity: 'info',
    pattern: /\.withOpacity\s*\(/g,
    message: () => 'withOpacity is deprecated — use withValues(alpha: …).',
    length: () => '.withOpacity('.length
  }
];
