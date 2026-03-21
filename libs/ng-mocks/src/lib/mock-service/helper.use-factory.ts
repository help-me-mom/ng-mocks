import { FactoryProvider, Injector } from '@angular/core';

import { mapValues } from '../common/core.helpers';
import funcGetName from '../common/func.get-name';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import ngMocksUniverse from '../common/ng-mocks-universe';
import mockHelperStub from '../mock-helper/mock-helper.stub';
import mockInstanceApply from '../mock-instance/mock-instance-apply';

import { normalizeMockProperties } from './helper.mock-property';
import { MockService } from './mock-service';

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
  deps: [Injector],
  provide: def,
  useFactory: (injector?: Injector) => {
    const instance = init ? init() : MockService(def as any);
    normalizeMockProperties(instance as any, funcGetName(def));

    const configGlobal: Set<any> | undefined = ngMocksUniverse.getOverrides().get(def);
    const callbacks = configGlobal ? mapValues(configGlobal) : [];
    if (overrides) {
      callbacks.push(overrides);
    }
    callbacks.push(...mockInstanceApply(def));

    const finalInstance = applyCallback(def, instance, callbacks, injector, overrides);
    normalizeMockProperties(finalInstance as any, funcGetName(def));

    return finalInstance;
  },
});
