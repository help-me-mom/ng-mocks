import { Injector } from '@angular/core';
import * as angularCore from '@angular/core';

import coreConfig from './core.config';
import coreExtractRuntimeProvider from './core.extract-runtime-provider';

interface AngularRuntime {
  effect?: (callback: () => void, options: { injector: Injector }) => unknown;
  afterNextRender?: (callback: () => void, options: { injector: Injector }) => unknown;
  ɵEffectScheduler?: unknown;
  ɵAfterRenderManager?: unknown;
}

const runtime: AngularRuntime = angularCore;
let effectManager: unknown;
let afterRenderImpl: unknown;

export default (provide: unknown): boolean => {
  if (typeof provide !== 'function') {
    return false;
  }
  if (coreConfig.neverMockProvidedFunction.indexOf(provide) !== -1) {
    return true;
  }

  // istanbul ignore next: Angular 16 is covered by tests/issue-15005/effect.spec.ts in the compatibility matrix.
  if (runtime.effect && !runtime.ɵEffectScheduler && !effectManager) {
    effectManager = coreExtractRuntimeProvider(injector => runtime.effect!(() => undefined, { injector }));
  }
  if (runtime.afterNextRender && runtime.ɵAfterRenderManager && !afterRenderImpl) {
    // Server rendering returns before requesting the implementation; retry a later browser call.
    afterRenderImpl = coreExtractRuntimeProvider(
      // Capture stops before callback registration, so this required callback cannot execute.
      injector => runtime.afterNextRender!(/* istanbul ignore next */ () => undefined, { injector }),
      runtime.ɵAfterRenderManager,
    );
  }

  return provide === effectManager || provide === afterRenderImpl;
};
