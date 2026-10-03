import { Injector, PLATFORM_ID } from '@angular/core';

import coreDefineProperty from './core.define-property';

// Some Angular runtime providers are private closure values. Observe the native
// injector request and stop before constructing a service or registering a callback.
export default (register: (injector: Injector) => void, manager?: unknown): unknown => {
  const stop = {};
  let result: unknown;
  let waitingForManager = manager !== undefined;
  const injector: Injector = Object.create(Injector.prototype);
  coreDefineProperty(injector, 'get', (provide: unknown) => {
    if (waitingForManager) {
      // Angular 18 checks this discovery injector's platform before the render manager.
      if (provide === PLATFORM_ID) {
        return 'browser';
      }
      if (provide !== manager) {
        throw new Error('Unexpected Angular after-render manager');
      }
      waitingForManager = false;

      return { impl: null };
    }

    result = provide;
    throw stop;
  });

  try {
    register(injector);
  } catch (error) {
    if (error !== stop) {
      throw error;
    }
  }

  return result;
};
