import { CommonModule } from '@angular/common';
import { ApplicationModule } from '@angular/core';
import * as angularCore from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import * as angularPlatformBrowser from '@angular/platform-browser';

import { isNgInjectionToken } from './func.is-ng-injection-token';

const core = angularCore as unknown as Record<string, unknown>;
const browser = angularPlatformBrowser as unknown as Record<string, unknown>;

export default {
  flags: ['cacheModule', 'cacheComponent', 'cacheDirective', 'cacheProvider', 'correctModuleExports'],
  mockRenderCacheSize: 25,
  neverMockModule: [ApplicationModule, CommonModule, BrowserModule],
  neverMockProvidedFunction: [
    ...[
      'Injector',
      'RendererFactory2',
      'Sanitizer',
      'ApplicationInitStatus',
      'ApplicationRef',
      'Compiler',
      'IterableDiffers',
      'KeyValueDiffers',
      'ɵAfterRenderEventManager',
      'ɵAfterRenderManager',
      'ɵPendingTasks',
      'PendingTasks',
      'ɵPendingTasksInternal',
      'ɵEffectScheduler',
    ].map(name => core[name]),
    ...[
      'ɵDomRendererFactory2',
      'EventManager',
      'DomSanitizer',
      'ɵDomSanitizerImpl',
      'ɵe', // Angular 5's DomSanitizerImpl export.
    ].map(name => browser[name]),
  ].filter(value => typeof value === 'function'),
  neverMockToken: [
    ...[
      'ɵINJECTOR_SCOPE',
      'APP_ID',
      'DEFAULT_CURRENCY_CODE',
      'LOCALE_ID',
      // Angular 8–12 export SCHEDULER under changing aliases also reused for other values.
      'ɵangular_packages_core_core_ba',
      'ɵangular_packages_core_core_x',
      'ɵangular_packages_core_core_y',
      'ɵangular_packages_core_core_bf',
    ].map(name => core[name]),
    ...['EVENT_MANAGER_PLUGINS', 'HAMMER_GESTURE_CONFIG'].map(name => browser[name]),
  ].filter(isNgInjectionToken),
  onMockBuilderMissingDependency: 'throw',
  onMockInstanceRestoreNeed: 'warn',
  onTestBedFlushNeed: 'warn',

  dependencies: [
    'declarations',
    'hostDirectives',
    'entryComponents',
    'bootstrap',
    'providers',
    'viewProviders',
    'imports',
    'exports',
  ] as const,
};
