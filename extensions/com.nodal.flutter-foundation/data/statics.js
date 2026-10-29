'use strict';

// Static surfaces: icon and color constants, enum values, and member lists per receiver type.
// Baseline: Flutter 3.24 stable.

const ICONS = (
  'home search settings arrow_back arrow_forward arrow_upward arrow_downward arrow_drop_down ' +
  'close menu add remove check check_circle cancel delete edit share favorite favorite_border ' +
  'star star_border person person_add person_remove group account_circle logout login lock lock_open ' +
  'visibility visibility_off notifications notifications_off notifications_active email phone call ' +
  'message chat send attach_file camera_alt photo image videocam music_note play_arrow pause stop ' +
  'skip_next skip_previous volume_up volume_off volume_mute mic mic_off download upload cloud_upload ' +
  'cloud_download folder folder_open insert_drive_file save print refresh sync replay more_vert ' +
  'more_horiz list grid_view view_list dashboard apps calendar_today schedule alarm timer place ' +
  'location_on map navigation my_location directions flight train shopping_cart shopping_bag store ' +
  'payment credit_card receipt local_offer qr_code_scanner dark_mode light_mode brightness_6 palette ' +
  'brush format_paint text_fields title code terminal bug_report build construction done done_all error ' +
  'error_outline warning info help support feedback language translate wifi wifi_off battery_full ' +
  'bluetooth cast screen_share fullscreen fullscreen_exit zoom_in zoom_out filter_list sort tune ' +
  'table_chart analytics trending_up pie_chart bar_chart chevron_left chevron_right expand_more ' +
  'expand_less keyboard_arrow_down keyboard_arrow_up first_page last_page undo redo copy content_copy ' +
  'content_paste cut link open_in_new verified new_releases auto_awesome celebration emoji_emotions ' +
  'shopping_cart_checkout inventory phone_iphone tablet laptop desktop_mac watch straighten ' +
  'format_align_left format_align_center format_align_right format_bold format_italic ' +
  'format_underlined format_list_bulleted format_list_numbered table_view view_module view_week ' +
  'pending hourglass_empty update history restore delete_forever clear_all select_all ' +
  'arrow_back_ios arrow_forward_ios arrow_circle_up arrow_circle_down keyboard_return space_bar ' +
  'gesture touch_app pan_tool swipe_right drag_indicator swap_horiz swap_vert unfold_more unfold_less ' +
  'stairs expand_circle_down collapse_all open_in_full close_fullscreen photo_library collections ' +
  'insert_photo add_photo_alternate wifi_tethering signal_cellular_alt battery_charging_full ' +
  'cloud_off offline_bolt hourglass_top hourglass_bottom timer_10 timer_3 snooze bedtime sunny ' +
  'water_drop opacity gradient format_color_fill interests sports_basketball fitness_center ' +
  'restaurant local_cafe local_bar hotel movie theater shopping_basket receipt_long request_quote ' +
  'attach_money currency_exchange savings card_giftcard redeem price_check sell ' +
  'arrow_upward_alt arrow_downward_alt subdirectory_arrow_right subdirectory_arrow_left ' +
  'keyboard_double_arrow_left keyboard_double_arrow_right keyboard_double_arrow_up ' +
  'keyboard_double_arrow_down file_download file_upload create_new_folder drive_file_move ' +
  'picture_as_pdf article description notes sticky_note_2 task alt_route route signpost'
).split(/\s+/);

const COLORS = [
  'transparent', 'black', 'black87', 'black54', 'black45', 'black38', 'black26', 'black12',
  'white', 'white70', 'white60', 'white54', 'white38', 'white30', 'white24', 'white12', 'white10',
  'red', 'pink', 'purple', 'deepPurple', 'indigo', 'blue', 'lightBlue', 'cyan', 'teal', 'green',
  'lightGreen', 'lime', 'yellow', 'amber', 'orange', 'deepOrange', 'brown', 'grey', 'blueGrey',
  'redAccent', 'pinkAccent', 'purpleAccent', 'deepPurpleAccent', 'indigoAccent', 'blueAccent',
  'lightBlueAccent', 'cyanAccent', 'tealAccent', 'greenAccent', 'lightGreenAccent', 'limeAccent',
  'yellowAccent', 'amberAccent', 'orangeAccent', 'deepOrangeAccent'
];

const COLOR_MEMBERS = [
  ['withValues', 'Color withValues({double? alpha, double? red, double? green, double? blue, ColorSpace? colorSpace})', 'A copy with adjusted channels.'],
  ['withOpacity', 'Color withOpacity(double opacity)', 'Deprecated — use withValues(alpha: ...).'],
  ['withAlpha', 'Color withAlpha(int a)', 'A copy with the given alpha (0-255).'],
  ['withRed', 'Color withRed(int r)', 'A copy with the given red channel.'],
  ['withGreen', 'Color withGreen(int g)', 'A copy with the given green channel.'],
  ['withBlue', 'Color withBlue(int b)', 'A copy with the given blue channel.'],
  ['computeLuminance', 'double computeLuminance()', 'The relative luminance of the color.'],
  ['toARGB32', 'int toARGB32()', 'The color as 0xAARRGGBB.'],
  ['value', 'int get value', 'The color as a 32-bit ARGB value.'],
  ['alpha', 'int get alpha', 'The alpha channel, 0-255.'],
  ['red', 'int get red', 'The red channel, 0-255.'],
  ['green', 'int get green', 'The green channel, 0-255.'],
  ['blue', 'int get blue', 'The blue channel, 0-255.'],
  ['opacity', 'double get opacity', 'The alpha as a fraction.'],
  ['hashCode', 'int get hashCode', 'The hash code of the color.']
];

const COLOR_NAMES = [
  ['red', 'Material red palette.'],
  ['pink', 'Material pink palette.'],
  ['purple', 'Material purple palette.'],
  ['deepPurple', 'Material deep purple palette.'],
  ['indigo', 'Material indigo palette.'],
  ['blue', 'Material blue palette.'],
  ['lightBlue', 'Material light blue palette.'],
  ['cyan', 'Material cyan palette.'],
  ['teal', 'Material teal palette.'],
  ['green', 'Material green palette.'],
  ['lightGreen', 'Material light green palette.'],
  ['lime', 'Material lime palette.'],
  ['yellow', 'Material yellow palette.'],
  ['amber', 'Material amber palette.'],
  ['orange', 'Material orange palette.'],
  ['deepOrange', 'Material deep orange palette.'],
  ['brown', 'Material brown palette.'],
  ['grey', 'Material grey palette.'],
  ['blueGrey', 'Material blue grey palette.'],
  ['redAccent', 'Material red accent palette.'],
  ['pinkAccent', 'Material pink accent palette.'],
  ['purpleAccent', 'Material purple accent palette.'],
  ['deepPurpleAccent', 'Material deep purple accent palette.'],
  ['indigoAccent', 'Material indigo accent palette.'],
  ['blueAccent', 'Material blue accent palette.'],
  ['lightBlueAccent', 'Material light blue accent palette.'],
  ['cyanAccent', 'Material cyan accent palette.'],
  ['tealAccent', 'Material teal accent palette.'],
  ['greenAccent', 'Material green accent palette.'],
  ['lightGreenAccent', 'Material light green accent palette.'],
  ['limeAccent', 'Material lime accent palette.'],
  ['yellowAccent', 'Material yellow accent palette.'],
  ['amberAccent', 'Material amber accent palette.'],
  ['orangeAccent', 'Material orange accent palette.'],
  ['deepOrangeAccent', 'Material deep orange accent palette.'],
  ['black', 'Opaque black.'],
  ['white', 'Opaque white.'],
  ['transparent', 'Fully transparent.']
];

const ENUM_VALUES = {
  MainAxisAlignment: ['start', 'end', 'center', 'spaceBetween', 'spaceAround', 'spaceEvenly'],
  CrossAxisAlignment: ['start', 'end', 'center', 'stretch', 'baseline'],
  MainAxisSize: ['min', 'max'],
  VerticalDirection: ['up', 'down'],
  TextAlign: ['left', 'right', 'center', 'justify', 'start', 'end'],
  TextDirection: ['ltr', 'rtl'],
  TextOverflow: ['clip', 'fade', 'ellipsis', 'visible'],
  TextBaseline: ['alphabetic', 'ideographic'],
  FontStyle: ['normal', 'italic'],
  FontWeight: ['w100', 'w200', 'w300', 'w400', 'w500', 'w600', 'w700', 'w800', 'w900', 'bold', 'normal', 'light', 'medium', 'semiBold', 'extraBold', 'black', 'thin', 'extraLight'],
  TextDecoration: ['none', 'underline', 'overline', 'lineThrough', 'combine'],
  BoxFit: ['fill', 'contain', 'cover', 'fitWidth', 'fitHeight', 'none', 'scaleDown'],
  BoxShape: ['rectangle', 'circle'],
  BorderStyle: ['none', 'solid'],
  Clip: ['none', 'hardEdge', 'antiAlias', 'antiAliasWithSaveLayer'],
  Alignment: ['topLeft', 'topCenter', 'topRight', 'centerLeft', 'center', 'centerRight', 'bottomLeft', 'bottomCenter', 'bottomRight'],
  Axis: ['horizontal', 'vertical'],
  WrapAlignment: ['start', 'end', 'center', 'spaceBetween', 'spaceAround', 'spaceEvenly'],
  WrapCrossAlignment: ['start', 'end', 'center'],
  StackFit: ['loose', 'expand', 'passthrough'],
  Overflow: ['visible', 'clip'],
  ThemeMode: ['system', 'light', 'dark'],
  Brightness: ['light', 'dark'],
  HitTestBehavior: ['deferToChild', 'opaque', 'translucent'],
  DismissDirection: ['vertical', 'horizontal', 'endToStart', 'startToEnd', 'up', 'down', 'none'],
  SnackBarBehavior: ['fixed', 'floating'],
  SnackBarCloseReason: ['swipe', 'hide', 'remove', 'timeout'],
  StepState: ['indexed', 'editing', 'complete', 'disabled', 'error'],
  StepperType: ['vertical', 'horizontal'],
  AutovalidateMode: ['disabled', 'always', 'onUserInteraction', 'onUnfocus'],
  TextInputAction: ['none', 'done', 'go', 'search', 'send', 'next', 'previous', 'continueAction', 'join', 'route', 'emergencyCall', 'newline'],
  TextCapitalization: ['none', 'words', 'sentences', 'characters'],
  ListTileControlAffinity: ['leading', 'trailing', 'platform'],
  NavigationDestinationLabelBehavior: ['alwaysShow', 'alwaysHide', 'onlyShowSelected'],
  NavigationRailLabelType: ['none', 'selected', 'all'],
  BottomNavigationBarType: ['fixed', 'shifting'],
  TabBarIndicatorSize: ['tab', 'label'],
  MaterialType: ['canvas', 'card', 'circle', 'button', 'transparency'],
  ScrollPositionAlignmentPolicy: ['explicit', 'keepVisibleAtEnd', 'keepVisibleAtStart'],
  FilterQuality: ['none', 'low', 'medium', 'high'],
  ImageRepeat: ['noRepeat', 'repeat', 'repeatX', 'repeatY'],
  PlaceholderAlignment: ['baseline', 'aboveBaseline', 'belowBaseline', 'top', 'bottom', 'middle'],
  VisualDensity: ['compact', 'standard', 'comfortable'],
  MaterialTapTargetSize: ['padded', 'shrinkWrap'],
  CupertinoDatePickerMode: ['time', 'date', 'dateAndTime'],
  CupertinoTimerPickerMode: ['hm', 'ms', 'hms'],
  AxisDirection: ['up', 'down', 'left', 'right'],
  DragStartBehavior: ['down', 'start']
};

// Static and instance members per Flutter receiver type: [name, signature, doc].
const TYPE_MEMBERS = {
  ThemeData: [
    ['colorScheme', 'ColorScheme get colorScheme', 'The Material color roles.'],
    ['textTheme', 'TextTheme get textTheme', 'The Material text styles.'],
    ['primaryTextTheme', 'TextTheme get primaryTextTheme', 'Text styles for the primary color surface.'],
    ['brightness', 'Brightness get brightness', 'Whether the theme is light or dark.'],
    ['useMaterial3', 'bool get useMaterial3', 'Whether Material 3 is active.'],
    ['scaffoldBackgroundColor', 'Color get scaffoldBackgroundColor', 'Background color of Scaffold bodies.'],
    ['cardColor', 'Color get cardColor', 'Default Card color.'],
    ['dividerColor', 'Color get dividerColor', 'Default Divider color.'],
    ['canvasColor', 'Color get canvasColor', 'Default canvas color.'],
    ['primaryColor', 'Color get primaryColor', 'The primary palette color.'],
    ['iconTheme', 'IconThemeData get iconTheme', 'Default icon theme.'],
    ['appBarTheme', 'AppBarTheme get appBarTheme', 'Theme for AppBar widgets.'],
    ['elevatedButtonTheme', 'ElevatedButtonThemeData get elevatedButtonTheme', 'Theme for elevated buttons.'],
    ['inputDecorationTheme', 'InputDecorationTheme get inputDecorationTheme', 'Theme for text fields.'],
    ['visualDensity', 'VisualDensity get visualDensity', 'How compact the layout is.'],
    ['extensions', 'Iterable<ThemeExtension<dynamic>> get extensions', 'Custom theme extensions.'],
    ['copyWith', 'ThemeData copyWith({Color? primaryColor, Brightness? brightness, ...})', 'A copy with parts replaced.'],
    ['light', 'static ThemeData light({Color? primarySwatch})', 'The default light theme.'],
    ['dark', 'static ThemeData dark({Color? primarySwatch})', 'The default dark theme.'],
    ['of', 'static ThemeData of(BuildContext context)', 'The nearest theme.']
  ],
  TextTheme: [
    ['displayLarge', 'TextStyle? get displayLarge', 'Largest display style.'],
    ['displayMedium', 'TextStyle? get displayMedium', 'Medium display style.'],
    ['displaySmall', 'TextStyle? get displaySmall', 'Small display style.'],
    ['headlineLarge', 'TextStyle? get headlineLarge', 'Large headline style.'],
    ['headlineMedium', 'TextStyle? get headlineMedium', 'Medium headline style.'],
    ['headlineSmall', 'TextStyle? get headlineSmall', 'Small headline style.'],
    ['titleLarge', 'TextStyle? get titleLarge', 'Large title style.'],
    ['titleMedium', 'TextStyle? get titleMedium', 'Medium title style.'],
    ['titleSmall', 'TextStyle? get titleSmall', 'Small title style.'],
    ['bodyLarge', 'TextStyle? get bodyLarge', 'Large body style.'],
    ['bodyMedium', 'TextStyle? get bodyMedium', 'Medium body style.'],
    ['bodySmall', 'TextStyle? get bodySmall', 'Small body style.'],
    ['labelLarge', 'TextStyle? get labelLarge', 'Large label style.'],
    ['labelMedium', 'TextStyle? get labelMedium', 'Medium label style.'],
    ['labelSmall', 'TextStyle? get labelSmall', 'Small label style.'],
    ['copyWith', 'TextTheme copyWith({TextStyle? bodyMedium, ...})', 'A copy with styles replaced.'],
    ['apply', 'TextTheme apply({String? fontFamily, Color? displayColor, Color? bodyColor})', 'A copy with a font family or color applied.']
  ],
  ColorScheme: [
    ['primary', 'Color get primary', 'The main brand color.'],
    ['onPrimary', 'Color get onPrimary', 'Content drawn on primary.'],
    ['primaryContainer', 'Color get primaryContainer', 'A lower-emphasis primary.'],
    ['onPrimaryContainer', 'Color get onPrimaryContainer', 'Content drawn on primaryContainer.'],
    ['secondary', 'Color get secondary', 'The secondary accent color.'],
    ['onSecondary', 'Color get onSecondary', 'Content drawn on secondary.'],
    ['secondaryContainer', 'Color get secondaryContainer', 'A lower-emphasis secondary.'],
    ['tertiary', 'Color get tertiary', 'The tertiary accent color.'],
    ['error', 'Color get error', 'The error color.'],
    ['onError', 'Color get onError', 'Content drawn on error.'],
    ['errorContainer', 'Color get errorContainer', 'A lower-emphasis error color.'],
    ['surface', 'Color get surface', 'The base surface color.'],
    ['onSurface', 'Color get onSurface', 'Content drawn on surface.'],
    ['onSurfaceVariant', 'Color get onSurfaceVariant', 'Lower-emphasis content color.'],
    ['surfaceContainerHighest', 'Color get surfaceContainerHighest', 'The highest surface container tone.'],
    ['outline', 'Color get outline', 'Borders and dividers.'],
    ['shadow', 'Color get shadow', 'The color of shadows.'],
    ['inversePrimary', 'Color get inversePrimary', 'Primary color on inverse surfaces.'],
    ['brightness', 'Brightness get brightness', 'Whether the scheme is light or dark.'],
    ['copyWith', 'ColorScheme copyWith({Color? primary, Color? surface, ...})', 'A copy with roles replaced.'],
    ['fromSeed', 'static ColorScheme fromSeed({Color seedColor = Colors.blue, Brightness brightness = Brightness.light, ...})', 'Generates a scheme from one seed color.']
  ],
  MediaQueryData: [
    ['size', 'Size get size', 'The screen size in logical pixels.'],
    ['padding', 'EdgeInsets get padding', 'Obstructions like the status bar.'],
    ['viewPadding', 'EdgeInsets get viewPadding', 'Paddings not consumed by other widgets.'],
    ['viewInsets', 'EdgeInsets get viewInsets', 'On-screen keyboard insets.'],
    ['devicePixelRatio', 'double get devicePixelRatio', 'Physical pixels per logical pixel.'],
    ['orientation', 'Orientation get orientation', 'Portrait or landscape.'],
    ['textScaler', 'TextScaler get textScaler', 'The user text scale factor.'],
    ['textScaleFactor', 'double get textScaleFactor', 'Deprecated — use textScaler.'],
    ['platformBrightness', 'Brightness get platformBrightness', 'The OS light/dark setting.'],
    ['accessibleNavigation', 'bool get accessibleNavigation', 'Whether an accessibility service is active.'],
    ['boldText', 'bool get boldText', 'Whether the OS requests bold text.'],
    ['highContrast', 'bool get highContrast', 'Whether high contrast is requested.'],
    ['disableAnimations', 'bool get disableAnimations', 'Whether animations should be reduced.'],
    ['copyWith', 'MediaQueryData copyWith({Size? size, EdgeInsets? padding, ...})', 'A copy with parts replaced.'],
    ['of', 'static MediaQueryData of(BuildContext context)', 'The nearest media data.']
  ],
  NavigatorState: [
    ['push', 'Future<T?> push<T extends Object?>(Route<T> route)', 'Pushes a route.'],
    ['pushNamed', 'Future<T?> pushNamed<T extends Object?>(String routeName, {Object? arguments})', 'Pushes a named route.'],
    ['pushReplacement', 'Future<T?> pushReplacement<T extends Object?, TO extends Object?>(Route<T> newRoute, {TO? result})', 'Replaces the current route.'],
    ['pushReplacementNamed', 'Future<T?> pushReplacementNamed<T extends Object?, TO extends Object?>(String routeName, {TO? result, Object? arguments})', 'Replaces with a named route.'],
    ['pushAndRemoveUntil', 'Future<T?> pushAndRemoveUntil<T extends Object?>(Route<T> newRoute, RoutePredicate predicate)', 'Pushes and removes previous routes.'],
    ['pushNamedAndRemoveUntil', 'Future<T?> pushNamedAndRemoveUntil<T extends Object?>(String newRouteName, RoutePredicate predicate, {Object? arguments})', 'Pushes a named route and removes previous ones.'],
    ['pop', 'void pop<T extends Object?>([T? result])', 'Pops the current route.'],
    ['popUntil', 'void popUntil(RoutePredicate predicate)', 'Pops until the predicate matches.'],
    ['maybePop', 'Future<bool> maybePop<T extends Object?>([T? result])', 'Pops if the route allows it.'],
    ['canPop', 'bool canPop()', 'Whether there is a route below.'],
    ['removeRoute', 'void removeRoute(Route route)', 'Removes a route from the stack.']
  ],
  ScaffoldMessengerState: [
    ['showSnackBar', 'ScaffoldFeatureController<SnackBar, SnackBarClosedReason> showSnackBar(SnackBar snackBar, {AnimationStyle? snackBarAnimationStyle})', 'Shows a SnackBar.'],
    ['hideCurrentSnackBar', 'void hideCurrentSnackBar({SnackBarClosedReason reason = SnackBarClosedReason.hide})', 'Hides the visible SnackBar.'],
    ['removeCurrentSnackBar', 'void removeCurrentSnackBar({SnackBarClosedReason reason = SnackBarClosedReason.remove})', 'Removes the visible SnackBar immediately.'],
    ['clearSnackBars', 'void clearSnackBars()', 'Removes every queued SnackBar.']
  ],
  ScaffoldState: [
    ['openDrawer', 'void openDrawer()', 'Opens the drawer.'],
    ['closeDrawer', 'void closeDrawer()', 'Closes the drawer.'],
    ['openEndDrawer', 'void openEndDrawer()', 'Opens the end drawer.'],
    ['closeEndDrawer', 'void closeEndDrawer()', 'Closes the end drawer.'],
    ['showSnackBar', 'ScaffoldFeatureController showSnackBar(SnackBar snackBar)', 'Deprecated — use ScaffoldMessenger.of(context).'],
    ['showBottomSheet', 'PersistentBottomSheetController showBottomSheet(WidgetBuilder builder)', 'Shows a persistent bottom sheet.']
  ],
  AnimationController: [
    ['forward', 'TickerFuture forward({double? from})', 'Plays the animation forwards.'],
    ['reverse', 'TickerFuture reverse({double? from})', 'Plays the animation backwards.'],
    ['repeat', 'TickerFuture repeat({double? min, double? max, bool reverse = false, Duration? period})', 'Loops the animation.'],
    ['animateTo', 'TickerFuture animateTo(double target, {Duration? duration, Curve curve = Curves.ease})', 'Animate to a value.'],
    ['animateBack', 'TickerFuture animateBack(double target, {Duration? duration, Curve curve = Curves.ease})', 'Animate back to a value.'],
    ['stop', 'void stop({bool canceled = true})', 'Stops the animation.'],
    ['reset', 'void reset()', 'Resets to the lower bound.'],
    ['value', 'double get value', 'The current value.'],
    ['status', 'AnimationStatus get status', 'The current animation status.'],
    ['duration', 'Duration? duration', 'The forward duration.'],
    ['addListener', 'void addListener(VoidCallback listener)', 'Registers a value listener.'],
    ['addStatusListener', 'void addStatusListener(AnimationStatusListener listener)', 'Registers a status listener.'],
    ['removeListener', 'void removeListener(VoidCallback listener)', 'Removes a value listener.'],
    ['dispose', 'void dispose()', 'Releases the controller.']
  ],
  TextEditingController: [
    ['text', 'String get text', 'The current text.'],
    ['text', 'set text(String newText)', 'Replaces the text.'],
    ['value', 'TextEditingValue get value', 'The text and selection.'],
    ['selection', 'TextSelection get selection', 'The current selection.'],
    ['clear', 'void clear()', 'Clears the text.'],
    ['addListener', 'void addListener(VoidCallback listener)', 'Registers a change listener.'],
    ['removeListener', 'void removeListener(VoidCallback listener)', 'Removes a change listener.'],
    ['dispose', 'void dispose()', 'Releases the controller.']
  ],
  ScrollController: [
    ['offset', 'double get offset', 'The current scroll offset.'],
    ['position', 'ScrollPosition get position', 'The attached scroll position.'],
    ['hasClients', 'bool get hasClients', 'Whether a scroll view is attached.'],
    ['animateTo', 'Future<void> animateTo(double offset, {Duration duration = const Duration(milliseconds: 300), Curve curve = Curves.ease})', 'Scrolls smoothly to an offset.'],
    ['jumpTo', 'void jumpTo(double value)', 'Scrolls immediately to an offset.'],
    ['addListener', 'void addListener(VoidCallback listener)', 'Registers a scroll listener.'],
    ['removeListener', 'void removeListener(VoidCallback listener)', 'Removes a scroll listener.'],
    ['dispose', 'void dispose()', 'Releases the controller.']
  ],
  PageController: [
    ['page', 'double? get page', 'The current page.'],
    ['initialPage', 'int get initialPage', 'The page shown first.'],
    ['jumpToPage', 'void jumpToPage(int page)', 'Jumps to a page.'],
    ['animateToPage', 'Future<void> animateToPage(int page, {Duration duration = const Duration(milliseconds: 300), Curve curve = Curves.easeInOut})', 'Animates to a page.'],
    ['nextPage', 'Future<void> nextPage({Duration duration = const Duration(milliseconds: 300), Curve curve = Curves.easeInOut})', 'Moves to the next page.'],
    ['previousPage', 'Future<void> previousPage({Duration duration = const Duration(milliseconds: 300), Curve curve = Curves.easeInOut})', 'Moves to the previous page.'],
    ['hasClients', 'bool get hasClients', 'Whether a PageView is attached.'],
    ['dispose', 'void dispose()', 'Releases the controller.']
  ],
  TabController: [
    ['index', 'int get index', 'The selected tab index.'],
    ['index', 'set index(int value)', 'Selects a tab.'],
    ['previousIndex', 'int? get previousIndex', 'The previously selected index.'],
    ['length', 'int get length', 'Number of tabs.'],
    ['animateTo', 'void animateTo(int value)', 'Animates to a tab.'],
    ['indexIsChanging', 'bool get indexIsChanging', 'Whether the index is animating.'],
    ['addListener', 'void addListener(VoidCallback listener)', 'Registers a listener.'],
    ['removeListener', 'void removeListener(VoidCallback listener)', 'Removes a listener.']
  ],
  BuildContext: [
    ['mounted', 'bool get mounted', 'Whether the element is still in the tree.'],
    ['size', 'Size get size', 'The size of the rendered widget.'],
    ['findRenderObject', 'RenderObject? findRenderObject()', 'The render object for this context.'],
    ['dependOnInheritedWidgetOfExactType', 'T? dependOnInheritedWidgetOfExactType<T extends InheritedWidget>({Object? aspect})', 'Reads an inherited widget and rebuilds on change.'],
    ['getInheritedWidgetOfExactType', 'T? getInheritedWidgetOfExactType<T extends InheritedWidget>()', 'Reads an inherited widget without subscribing.'],
    ['findAncestorStateOfType', 'T? findAncestorStateOfType<T extends State>()', 'The nearest ancestor state of a type.'],
    ['visitChildElements', 'void visitChildElements(ElementVisitor visitor)', 'Visits direct child elements.'],
    ['read', 'T read<T>()', 'Reads a provider without listening (package:provider).'],
    ['watch', 'T watch<T>()', 'Reads a provider and rebuilds on change (package:provider).'],
    ['select', 'R select<T, R>(R Function(T value) selector)', 'Watches a slice of a provider (package:provider).'],
    ['go', 'void go(String location)', 'Navigates with go_router.'],
    ['goNamed', 'void goNamed(String name, {Map<String, String> pathParameters, Map<String, dynamic> queryParameters})', 'Navigates to a named go_router route.'],
    ['push', 'Future<T?> push<T extends Object?>(String location)', 'Pushes a go_router location.'],
    ['pop', 'void pop<T extends Object?>([T? result])', 'Pops the current go_router route.'],
    ['replace', 'void replace(String location)', 'Replaces the current go_router location.'],
    ['canPop', 'bool canPop()', 'Whether go_router can pop.'],
    ['read_provider', 'T read<T>(WidgetRef ref)', 'Placeholder — use ref.read for Riverpod.']
  ],
  WidgetRef: [
    ['watch', 'T watch<T>(ProviderListenable<T> provider)', 'Watches a Riverpod provider.'],
    ['read', 'T read<T>(ProviderListenable<T> provider)', 'Reads a Riverpod provider once.'],
    ['listen', 'void listen<T>(ProviderListenable<T> provider, void Function(T? previous, T next) listener)', 'Listens to a Riverpod provider.'],
    ['refresh', 'T refresh<T>(Refreshable<T> provider)', 'Recreates and returns a provider value.'],
    ['invalidate', 'void invalidate(ProviderOrFamily provider)', 'Invalidates a provider.'],
  ],
  WidgetTester: [
    ['pumpWidget', 'Future<void> pumpWidget(Widget widget, [Duration? duration])', 'Inflates a widget in the test.'],
    ['pump', 'Future<void> pump([Duration? duration])', 'Pumps a frame.'],
    ['pumpAndSettle', 'Future<int> pumpAndSettle([Duration duration = const Duration(milliseconds: 100)])', 'Pumps until no frames are scheduled.'],
    ['tap', 'Future<void> tap(Finder finder, {int? warnIfMissed, ...})', 'Taps a widget.'],
    ['longPress', 'Future<void> longPress(Finder finder, {...})', 'Long-presses a widget.'],
    ['enterText', 'Future<void> enterText(Finder finder, String text)', 'Types into a text field.'],
    ['drag', 'Future<void> drag(Finder finder, Offset offset)', 'Drags a widget.'],
    ['fling', 'Future<void> fling(Finder finder, Offset offset, double speed)', 'Flings a widget.'],
    ['state', 'T state<T extends State>(Finder finder)', 'The state of a matched StatefulWidget.'],
    ['widget', 'T widget<T extends Widget>(Finder finder)', 'The matched widget.'],
    ['ensureVisible', 'Future<void> ensureVisible(Finder finder)', 'Scrolls a widget into view.'],
    ['runAsync', 'Future<T> runAsync<T>(Future<T> Function() callback)', 'Runs real asynchronous work.'],
    ['binding', 'TestWidgetsFlutterBinding get binding', 'The test binding.']
  ],
  Size: [
    ['width', 'double get width', 'The width.'],
    ['height', 'double get height', 'The height.'],
    ['aspectRatio', 'double get aspectRatio', 'Width divided by height.'],
    ['shortestSide', 'double get shortestSide', 'The smaller side.'],
    ['longestSide', 'double get longestSide', 'The larger side.'],
    ['center', 'Offset get center', 'The center point.'],
    ['topLeft', 'Offset get topLeft', 'The top-left corner.'],
    ['bottomRight', 'Offset get bottomRight', 'The bottom-right corner.'],
    ['isEmpty', 'bool get isEmpty', 'Whether both sides are zero.'],
    ['isNotEmpty', 'bool get isNotEmpty', 'Whether either side is non-zero.']
  ],
  EdgeInsets: [
    ['left', 'double get left', 'Left inset.'],
    ['top', 'double get top', 'Top inset.'],
    ['right', 'double get right', 'Right inset.'],
    ['bottom', 'double get bottom', 'Bottom inset.'],
    ['horizontal', 'double get horizontal', 'Left plus right.'],
    ['vertical', 'double get vertical', 'Top plus bottom.'],
    ['topLeft', 'Offset get topLeft', 'The top-left inset as an offset.'],
    ['add', 'EdgeInsets add(EdgeInsets other)', 'The sum of two insets.'],
    ['subtract', 'EdgeInsets subtract(EdgeInsets other)', 'The difference of two insets.'],
    ['deflate', 'EdgeInsets deflate(double delta)', 'Shrinks every side.'],
    ['inflate', 'EdgeInsets inflate(double delta)', 'Grows every side.']
  ],
  Offset: [
    ['dx', 'double get dx', 'The horizontal component.'],
    ['dy', 'double get dy', 'The vertical component.'],
    ['distance', 'double get distance', 'Distance from the origin.'],
    ['translate', 'Offset translate(double dx, double dy)', 'A translated offset.'],
    ['scale', 'Offset scale(double scaleX, double scaleY)', 'A scaled offset.']
  ],
  Duration: [
    ['inDays', 'int get inDays', 'Whole days.'],
    ['inHours', 'int get inHours', 'Whole hours.'],
    ['inMinutes', 'int get inMinutes', 'Whole minutes.'],
    ['inSeconds', 'int get inSeconds', 'Whole seconds.'],
    ['inMilliseconds', 'int get inMilliseconds', 'Whole milliseconds.'],
    ['zero', 'static const Duration zero', 'A duration of zero.'],
    ['milliseconds', 'static const Duration milliseconds(int milliseconds)', 'A duration in milliseconds.'],
    ['seconds', 'static const Duration seconds(int seconds)', 'A duration in seconds.'],
    ['minutes', 'static const Duration minutes(int minutes)', 'A duration in minutes.'],
    ['hours', 'static const Duration hours(int hours)', 'A duration in hours.'],
    ['days', 'static const Duration days(int days)', 'A duration in days.']
  ],
  TextStyle: [
    ['copyWith', 'TextStyle copyWith({Color? color, double? fontSize, FontWeight? fontWeight, ...})', 'A copy with parts replaced.'],
    ['apply', 'TextStyle apply({Color? color, double? fontSize, String? fontFamily, ...})', 'A copy with derived properties.'],
    ['merge', 'TextStyle merge(TextStyle? other)', 'This style overridden by another.'],
    ['fontSize', 'double? get fontSize', 'The font size in logical pixels.'],
    ['fontWeight', 'FontWeight? get fontWeight', 'The font weight.'],
    ['color', 'Color? get color', 'The text color.']
  ],
  IconData: [
    ['codePoint', 'int get codePoint', 'The glyph code point.'],
    ['fontFamily', 'String? get fontFamily', 'The icon font family.'],
    ['matchTextDirection', 'bool get matchTextDirection', 'Whether the glyph follows text direction.']
  ]
};

// Static-only members offered when the receiver is the type name itself.
const STATIC_MEMBERS = {
  TextStyle: [
    ['lerp', 'static TextStyle? lerp(TextStyle? a, TextStyle? b, double t)', 'Interpolates between two styles.'],
    ['combine', 'static TextStyle? combine(TextStyle? a, TextStyle? b)', 'Layers one style over another.']
  ],
  EdgeInsets: [
    ['zero', 'static const EdgeInsets zero', 'No padding.'],
    ['all', 'static const EdgeInsets all(double value)', 'Padding on every side.'],
    ['symmetric', 'static const EdgeInsets symmetric({double vertical = 0, double horizontal = 0})', 'Symmetric padding.'],
    ['only', 'static const EdgeInsets only({double left = 0, double top = 0, double right = 0, double bottom = 0})', 'Padding on chosen sides.'],
    ['fromLTRB', 'static const EdgeInsets fromLTRB(double left, double top, double right, double bottom)', 'Padding from four sides.'],
    ['fromWindowPadding', 'static EdgeInsets fromWindowPadding(WindowPadding padding, double devicePixelRatio)', 'Converts window padding.']
  ],
  BorderRadius: [
    ['zero', 'static const BorderRadius zero', 'Square corners.'],
    ['all', 'static const BorderRadius all(Radius radius)', 'The same radius everywhere.'],
    ['circular', 'static const BorderRadius circular(double radius)', 'Circular corners.'],
    ['vertical', 'static const BorderRadius vertical({Radius top = Radius.zero, Radius bottom = Radius.zero})', 'Vertical corner radii.'],
    ['horizontal', 'static const BorderRadius horizontal({Radius left = Radius.zero, Radius right = Radius.zero})', 'Horizontal corner radii.']
  ],
  Border: [
    ['all', 'static Border all({Color color = const Color(0xFF000000), double width = 1.0, BorderStyle style = BorderStyle.solid})', 'A border with the same side on every edge.'],
    ['fromBorderSide', 'static Border fromBorderSide(BorderSide side)', 'The same side on every edge.'],
    ['symmetric', 'static Border symmetric({BorderSide vertical = BorderSide.none, BorderSide horizontal = BorderSide.none})', 'Symmetric sides.']
  ],
  BoxDecoration: [
    ['lerp', 'static BoxDecoration? lerp(BoxDecoration? a, BoxDecoration? b, double t)', 'Interpolates between two decorations.']
  ],
  Color: [
    ['values', 'static const List<Color> values', 'The predefined Material colors.'],
    ['fromARGB', 'static Color fromARGB(int a, int r, int g, int b)', 'A color from ARGB channels.'],
    ['fromRGBO', 'static Color fromRGBO(int r, int g, int b, double opacity)', 'A color from RGB plus opacity.'],
    ['lerp', 'static Color? lerp(Color? a, Color? b, double t)', 'Interpolates between two colors.']
  ],
  Colors: [
    ['primaries', 'static const Map<int, Color> primaries', 'The primary Material swatches.'],
    ['accents', 'static const Map<int, Color> accents', 'The accent Material swatches.']
  ],
  ThemeData: [
    ['light', 'static ThemeData light({Color? primarySwatch})', 'The default light theme.'],
    ['dark', 'static ThemeData dark({Color? primarySwatch})', 'The default dark theme.'],
    ['of', 'static ThemeData of(BuildContext context)', 'The nearest theme.'],
    ['localize', 'ThemeData localize(TextTheme? textTheme, ...)', 'The theme adapted to a locale.']
  ],
  Theme: [
    ['of', 'static ThemeData of(BuildContext context)', 'The nearest theme.'],
    ['maybeOf', 'static ThemeData? maybeOf(BuildContext context)', 'The nearest theme, if any.']
  ],
  MediaQuery: [
    ['of', 'static MediaQueryData of(BuildContext context)', 'The nearest media data.'],
    ['maybeOf', 'static MediaQueryData? maybeOf(BuildContext context)', 'The nearest media data, if any.'],
    ['sizeOf', 'static Size sizeOf(BuildContext context)', 'The screen size.'],
    ['paddingOf', 'static EdgeInsets paddingOf(BuildContext context)', 'The screen padding.'],
    ['viewInsetsOf', 'static EdgeInsets viewInsetsOf(BuildContext context)', 'The keyboard insets.']
  ],
  TextInputType: [
    ['text', 'static const TextInputType text', 'Plain text keyboard.'],
    ['number', 'static const TextInputType number', 'Numeric keyboard.'],
    ['numberWithOptions', 'static const TextInputType numberWithOptions({bool signed = false, bool decimal = false})', 'Numeric keyboard with options.'],
    ['emailAddress', 'static const TextInputType emailAddress', 'Email keyboard.'],
    ['multiline', 'static const TextInputType multiline', 'Multiline keyboard.'],
    ['datetime', 'static const TextInputType datetime', 'Date and time keyboard.'],
    ['telephone', 'static const TextInputType telephone', 'Phone keyboard.'],
    ['url', 'static const TextInputType url', 'URL keyboard.'],
    ['visiblePassword', 'static const TextInputType visiblePassword', 'Visible password keyboard.'],
    ['name', 'static const TextInputType name', 'Person name keyboard.'],
    ['streetAddress', 'static const TextInputType streetAddress', 'Address keyboard.']
  ],
  FocusScope: [
    ['of', 'static FocusScopeNode of(BuildContext context)', 'The nearest focus scope.'],
    ['maybeOf', 'static FocusScopeNode? maybeOf(BuildContext context)', 'The nearest focus scope, if any.']
  ],
  Navigator: [
    ['of', 'static NavigatorState of(BuildContext context, {bool rootNavigator = false})', 'The nearest navigator state.'],
    ['maybeOf', 'static NavigatorState? maybeOf(BuildContext context)', 'The nearest navigator state, if any.'],
    ['push', 'static Future<T?> push<T extends Object?>(BuildContext context, Route<T> route)', 'Pushes a route.'],
    ['pop', 'static void pop<T extends Object?>(BuildContext context, [T? result])', 'Pops the current route.'],
    ['pushNamed', 'static Future<T?> pushNamed<T extends Object?>(BuildContext context, String routeName, {Object? arguments})', 'Pushes a named route.']
  ],
  ScaffoldMessenger: [
    ['of', 'static ScaffoldMessengerState of(BuildContext context)', 'The nearest scaffold messenger.'],
    ['maybeOf', 'static ScaffoldMessengerState? maybeOf(BuildContext context)', 'The nearest scaffold messenger, if any.']
  ],
  Scaffold: [
    ['of', 'static ScaffoldState of(BuildContext context)', 'The nearest scaffold state.']
  ],
  DefaultTabController: [
    ['of', 'static TabController of(BuildContext context)', 'The nearest tab controller.']
  ],
  DateTime: [
    ['now', 'static DateTime now()', 'The current date and time.'],
    ['parse', 'static DateTime parse(String formattedString)', 'Parses an ISO-8601 string.']
  ]
};

// Properties offered when the receiver type is unknown (widget instances, untyped locals).
const WIDGET_MEMBERS = [
  ['padding', 'EdgeInsetsGeometry? get padding', 'The padding of a widget.'],
  ['margin', 'EdgeInsetsGeometry? get margin', 'The margin of a widget.'],
  ['width', 'double? get width', 'A fixed width.'],
  ['height', 'double? get height', 'A fixed height.'],
  ['color', 'Color? get color', 'A color property.'],
  ['child', 'Widget? get child', 'The child widget slot.'],
  ['children', 'List<Widget>? get children', 'The child widget list.'],
  ['onPressed', 'VoidCallback? get onPressed', 'The press callback.'],
  ['onTap', 'GestureTapCallback? get onTap', 'The tap callback.'],
  ['style', 'ButtonStyle? get style', 'The widget style.'],
  ['decoration', 'Decoration? get decoration', 'The box decoration.'],
  ['alignment', 'AlignmentGeometry? get alignment', 'The child alignment.'],
  ['mainAxisAlignment', 'MainAxisAlignment? get mainAxisAlignment', 'Main-axis alignment.'],
  ['crossAxisAlignment', 'CrossAxisAlignment? get crossAxisAlignment', 'Cross-axis alignment.']
];

module.exports = {
  ICONS,
  COLORS,
  COLOR_NAMES,
  COLOR_MEMBERS,
  ENUM_VALUES,
  TYPE_MEMBERS,
  STATIC_MEMBERS,
  WIDGET_MEMBERS
};
