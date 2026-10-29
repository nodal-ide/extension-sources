'use strict';

// Receiver and call-target resolution. Purely textual and bounded: catalog membership decides,
// nothing is guessed about types we do not ship.

const catalog = require('./catalog');

const RECEIVERS = [
  [/Theme\.of\(\s*context\s*\)\.textTheme$/, 'TextTheme'],
  [/Theme\.of\(\s*context\s*\)\.colorScheme$/, 'ColorScheme'],
  [/Theme\.of\(\s*context\s*\)\.primaryTextTheme$/, 'TextTheme'],
  [/Theme\.of\(\s*context\s*\)$/, 'ThemeData'],
  [/MediaQuery\.of\(\s*context\s*\)\.textScaler$/, 'TextScaler'],
  [/MediaQuery\.of\(\s*context\s*\)\.size$/, 'Size'],
  [/MediaQuery\.of\(\s*context\s*\)\.padding$/, 'EdgeInsets'],
  [/MediaQuery\.of\(\s*context\s*\)\.viewPadding$/, 'EdgeInsets'],
  [/MediaQuery\.of\(\s*context\s*\)\.viewInsets$/, 'EdgeInsets'],
  [/MediaQuery\.of\(\s*context\s*\)$/, 'MediaQueryData'],
  [/Navigator\.of\(\s*context(?:\s*,\s*rootNavigator\s*:\s*(?:true|false))?\s*\)$/, 'NavigatorState'],
  [/ScaffoldMessenger\.of\(\s*context\s*\)$/, 'ScaffoldMessengerState'],
  [/Scaffold\.of\(\s*context\s*\)$/, 'ScaffoldState'],
  [/FocusScope\.of\(\s*context\s*\)$/, 'FocusScopeNode'],
  [/DefaultTabController\.of\(\s*context\s*\)$/, 'TabController'],
  [/Colors\.(?:[A-Za-z_]\w*)(?:\.shade\d+|\.with\w+\(\s*\d+(?:\.\d+)?\s*\))?$/, 'Color'],
  [/Colors$/, 'Colors'],
  [/Icons$/, 'Icons'],
  [/CupertinoIcons$/, 'Icons']
];

const KNOWN_TYPES = new Set([
  ...catalog.framework.keys(),
  ...catalog.coreTypes.keys(),
  ...catalog.enumValues.keys(),
  ...catalog.typeMembers.keys(),
  ...catalog.staticMembers.keys()
]);

/** Resolves the expression before a `.` to a catalog receiver type. */
function resolveReceiver(expression) {
  const expr = expression.trim();
  if (!expr) return null;

  const slice = expr.length > 320 ? expr.slice(-320) : expr;
  for (const [pattern, type] of RECEIVERS) {
    if (pattern.test(slice)) return { type, bare: false };
  }

  if (/(?:^|[^\w$.])(context)$/.test(slice)) return { type: 'BuildContext', bare: false };
  if (/(?:^|[^\w$.])(ref)$/.test(slice)) return { type: 'WidgetRef', bare: false };
  if (/(?:^|[^\w$.])(tester)$/.test(slice)) return { type: 'WidgetTester', bare: false };

  if (/(?:^|[^\w$.])('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")$/.test(slice)) {
    return { type: 'String', bare: false };
  }

  const bare = slice.match(/(?:^|[^\w$.])([A-Z][A-Za-z0-9_]*)$/);
  if (bare && KNOWN_TYPES.has(bare[1])) return { type: bare[1], bare: true };

  return null;
}

/** Resolves a call chain such as `EdgeInsets.all` or `showDialog` to a catalog callable. */
function resolveCallable(chain) {
  if (!chain) return null;
  const direct = catalog.callables.get(chain);
  if (direct) return direct;
  if (chain.includes('.')) return null;
  return null;
}

module.exports = { resolveReceiver, resolveCallable, KNOWN_TYPES };
