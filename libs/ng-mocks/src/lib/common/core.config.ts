export default {
  flags: ['cacheModule', 'cacheComponent', 'cacheDirective', 'cacheProvider', 'correctModuleExports'],
  mockRenderCacheSize: 25,
  neverMockModule: ['ApplicationModule', 'CommonModule', 'BrowserModule'],
  neverMockProvidedFunction: [
    'DomRendererFactory2',
    'EventManager',
    'Injector', // ivy only
    'RendererFactory2',

    // https://github.com/ike18t/ng-mocks/issues/538
    'Sanitizer',
    'DomSanitizer',

    // ApplicationModule, A14 made them global at root level
    'ApplicationInitStatus',
    'ApplicationRef',
    'Compiler',
    'IterableDiffers',
    'KeyValueDiffers',
  ],
  neverMockToken: [
    'InjectionToken Set Injector scope.', // INJECTOR_SCOPE // ivy only
    'InjectionToken EventManagerPlugins', // EVENT_MANAGER_PLUGINS
    'InjectionToken HammerGestureConfig', // HAMMER_GESTURE_CONFIG

    // ApplicationModule, A14 made them global at root level
    'InjectionToken AppId', // APP_ID
    'InjectionToken DefaultCurrencyCode', // DEFAULT_CURRENCY_CODE
    'InjectionToken LocaleId', // LOCALE_ID
    'InjectionToken SCHEDULER_TOKEN', // SCHEDULER
  ],
  onMockInstanceRestoreNeed: 'warn',
  onTestBedFlushNeed: 'warn',
};
