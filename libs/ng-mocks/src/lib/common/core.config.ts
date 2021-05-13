import { CommonModule } from '@angular/common';
import { ApplicationModule } from '@angular/core';

export default {
  flags: ['cacheModule', 'cacheComponent', 'cacheDirective', 'cacheProvider', 'correctModuleExports'],
  neverMockModule: [ApplicationModule, CommonModule],
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
};
