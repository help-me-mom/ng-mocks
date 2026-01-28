import * as core from '@angular/core';
import { EnvironmentInjector, FactoryProvider, Injector, Optional } from '@angular/core';

import { mapValues } from '../common/core.helpers';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import ngMocksUniverse from '../common/ng-mocks-universe';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import mockInstanceApply from '../mock-instance/mock-instance-apply';

import { MockService } from './mock-service';

// Helper to run code in injection context when available (Angular 16+)
// Prefers EnvironmentInjector for more reliable injection context establishment in Angular 21+
const tryRunInInjectionContext = <T>(injector: EnvironmentInjector | Injector | undefined, fn: () => T): T => {
  // runInInjectionContext is available from Angular 16+
  // Using it ensures inject() calls work inside factory functions
  // We access it dynamically to avoid breaking older Angular versions
  const runInContext = (core as any).runInInjectionContext;
  if (injector && typeof runInContext === 'function') {
    try {
      return runInContext(injector, fn);
    } catch {
      // Fallback if runInInjectionContext fails (e.g., destroyed injector)
      return fn();
    }
  }
  return fn();
};

const applyCallbackToken = (def: any): boolean => isNgInjectionToken(def) || typeof def === 'string';

const applyCallback = (def: any, inst: any, callbacks: any[], injector?: Injector, overrides?: any): void => {
  let instance: any = inst;

  for (const callback of callbacks) {
    const override = callback(instance, injector);
    if (applyCallbackToken(def)) {
      instance = override;
      continue;
    }

    // overrides return real value.
    if (callback === overrides) {
      instance = override;
      continue;
    }

    if (!override) {
      continue;
    }

    instance = mockHelperStub(instance, override);
  }

  return instance;
};

export default <D, I>(
  def: D,
  init?: () => I,
  overrides?: (instance: I, injector: Injector) => I | Partial<I>,
): FactoryProvider => ({
  // Use both EnvironmentInjector (preferred for Angular 21+) and Injector as fallback.
  // Both are optional to ensure backward compatibility with older Angular versions.
  deps: [
    [new Optional(), EnvironmentInjector],
    [new Optional(), Injector],
  ],
  provide: def,
  useFactory: (environmentInjector?: EnvironmentInjector, injector?: Injector) => {
    // Run the entire factory body within an injection context (Angular 16+)
    // This ensures that any inject() calls inside init(), MockService(),
    // or callbacks will work correctly and not throw NG0203 errors.
    // Prefer EnvironmentInjector for more reliable context in Angular 21+.
    const contextInjector = environmentInjector || injector;

    return tryRunInInjectionContext(contextInjector, () => {
      const instance = init ? init() : MockService(def as any);

      const configGlobal: Set<any> | undefined = ngMocksUniverse.getOverrides().get(def);
      const callbacks = configGlobal ? mapValues(configGlobal) : [];
      if (overrides) {
        callbacks.push(overrides);
      }
      callbacks.push(...mockInstanceApply(def));

      return applyCallback(def, instance, callbacks, injector, overrides);
    });
  },
});
