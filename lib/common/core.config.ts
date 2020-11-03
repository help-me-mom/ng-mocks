import { CommonModule } from '@angular/common';
import { ApplicationModule } from '@angular/core';

export default {
  neverMockModule: [ApplicationModule, CommonModule],
  neverMockProvidedFunction: [
    'DomRendererFactory2',
    'DomSharedStylesHost',
    'EventManager',
    'Injector',
    'RendererFactory2',
  ],
  neverMockToken: [
    'InjectionToken Set Injector scope.',
    'InjectionToken Application Initializer',
    'InjectionToken EventManagerPlugins',
    'InjectionToken HammerGestureConfig',
  ],
};
