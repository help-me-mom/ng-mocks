// tslint:disable-next-line variable-name one-variable-per-declaration
let CommonModule, ApplicationModule, BrowserModule;
try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/common');
  CommonModule = module.CommonModule;
} catch {
  // nothing to do
}

try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/core');
  ApplicationModule = module.ApplicationModule;
} catch {
  // nothing to do
}

try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/platform-browser');
  BrowserModule = module.BrowserModule;
} catch {
  // nothing to do
}

export default {
  flags: ['cacheModule', 'cacheComponent', 'cacheDirective', 'cacheProvider', 'correctModuleExports'],
  mockRenderCacheSize: 25,
  neverMockModule: [ApplicationModule, CommonModule, BrowserModule],
  neverMockProvidedFunction: [
    'DomRendererFactory2',
    'EventManager',
    'Injector', // ivy only
    'RendererFactory2',

    // https://github.com/ike18t/ng-mocks/issues/538
    'Sanitizer',
    'DomSanitizer',
  ],
  neverMockToken: [
    'InjectionToken Set Injector scope.', // INJECTOR_SCOPE // ivy only
    'InjectionToken EventManagerPlugins', // EVENT_MANAGER_PLUGINS
    'InjectionToken HammerGestureConfig', // HAMMER_GESTURE_CONFIG
  ],
  onTestBedFlushNeed: 'warn',
};
