import { ngMocks } from '../mock-helper/mock-helper';

import {
  installRuntimeInject,
  resetRuntimeInject,
  runRuntimeInject,
} from './ng-mocks-runtime-inject';
import ngMocksUniverse from './ng-mocks-universe';

class TargetService {
  public echo(): string {
    return 'real';
  }
}

(TargetService as any).ɵprov = { providedIn: 'root' };

describe('ng-mocks-runtime-inject', () => {
  afterEach(() => resetRuntimeInject());

  describe('default auto-spy mode', () => {
    beforeEach(() => ngMocks.autoSpy('default'));
    afterEach(() => ngMocks.autoSpy('reset'));

    // @see https://github.com/help-me-mom/ng-mocks/issues/14899
    it('keeps runtime dependencies mocked without a custom spy factory', () => {
      const destroyCallbacks: Array<() => void> = [];
      const originalGet = jasmine
        .createSpy('get')
        .and.callFake((provide: any) => new provide());
      const injector = {
        get: originalGet,
        onDestroy: (callback: () => void) =>
          destroyCallbacks.push(callback),
      };
      const definition = {
        factory: null as null | (() => TargetService),
      };
      const declaration = {
        ɵcmp: definition,
        ɵfac: () => injector.get(TargetService),
      };

      installRuntimeInject(
        injector,
        new Set([declaration]),
        new Set(),
      );

      const service = definition.factory!();

      // Auto-spy selects method implementations, not whether dependencies are mocked.
      expect(service.echo()).toBeUndefined();
      expect(jasmine.isSpy(service.echo)).toBe(false);
      expect(injector.get(TargetService)).toBe(service);
      expect(originalGet).not.toHaveBeenCalled();

      destroyCallbacks[0]();

      expect(injector.get(TargetService).echo()).toEqual('real');
      expect(originalGet).toHaveBeenCalledTimes(1);
    });
  });

  // @see https://github.com/help-me-mom/ng-mocks/issues/14896
  for (const name of [
    'EffectManager',
    '_EffectManager',
    'AfterRenderEventManager',
    '_AfterRenderEventManager',
  ]) {
    it(`preserves ${name} while mocking an application dependency`, () => {
      let managerConstructorCalls = 0;
      let dependencyConstructorCalls = 0;

      class RuntimeManager {
        public constructor() {
          managerConstructorCalls += 1;
        }

        public echo(): string {
          return 'real manager';
        }
      }

      class ApplicationDependency {
        public constructor() {
          dependencyConstructorCalls += 1;
        }

        public echo(): string {
          return 'real dependency';
        }
      }

      Object.defineProperty(RuntimeManager, 'name', { value: name });
      (RuntimeManager as any).ɵprov = { providedIn: 'root' };
      (ApplicationDependency as any).ɵprov = { providedIn: 'root' };

      const destroyCallbacks: Array<() => void> = [];
      const originalGet = jasmine
        .createSpy('get')
        .and.callFake((provide: any) => new provide());
      const injector = {
        get: originalGet,
        onDestroy: (callback: () => void) =>
          destroyCallbacks.push(callback),
      };

      installRuntimeInject(injector, new Set(), new Set());

      const { manager, dependency } = runRuntimeInject(
        injector,
        () => ({
          manager: injector.get(RuntimeManager),
          dependency: injector.get(ApplicationDependency),
        }),
      );

      expect(manager instanceof RuntimeManager).toBe(true);
      expect(manager.echo()).toBe('real manager');
      expect(dependency.echo()).toBeUndefined();
      expect(dependency.echo).toHaveBeenCalled();
      expect(managerConstructorCalls).toBe(1);
      expect(dependencyConstructorCalls).toBe(0);
      expect(originalGet).toHaveBeenCalledWith(RuntimeManager);
      expect(originalGet).toHaveBeenCalledTimes(1);

      const configuredManager = { echo: () => 'configured manager' };
      originalGet.and.returnValue(configuredManager);

      const overriddenManager = runRuntimeInject(injector, () =>
        injector.get(RuntimeManager),
      );

      expect(overriddenManager).toBe(configuredManager);
      expect(overriddenManager.echo()).toBe('configured manager');
      expect(injector.get(ApplicationDependency)).toBe(dependency);
      expect(originalGet).toHaveBeenCalledTimes(2);
      expect(managerConstructorCalls).toBe(1);
      expect(dependencyConstructorCalls).toBe(0);

      destroyCallbacks[0]();
    });
  }

  it('honors an explicit mock resolution for untouched runtime infrastructure', () => {
    let constructorCalls = 0;
    let methodCalls = 0;

    class EffectManager {
      public constructor() {
        constructorCalls += 1;
      }

      public echo(): string {
        methodCalls += 1;

        return 'real manager';
      }
    }

    (EffectManager as any).ɵprov = { providedIn: 'root' };
    spyOn(ngMocksUniverse, 'getResolution').and.returnValue('mock');

    const destroyCallbacks: Array<() => void> = [];
    const originalGet = jasmine
      .createSpy('get')
      .and.callFake((provide: any) => new provide());
    const injector = {
      get: originalGet,
      onDestroy: (callback: () => void) =>
        destroyCallbacks.push(callback),
    };

    // No registered provider or touch protects the explicit mock resolution.
    installRuntimeInject(injector, new Set(), new Set());

    const manager = runRuntimeInject(injector, () =>
      injector.get(EffectManager),
    );

    expect(manager instanceof EffectManager).toBe(true);
    expect(originalGet).not.toHaveBeenCalled();
    expect(constructorCalls).toBe(0);
    expect(manager.echo()).toBeUndefined();
    expect(methodCalls).toBe(0);
    expect(manager.echo).toHaveBeenCalledTimes(1);

    destroyCallbacks[0]();
  });

  // @see https://github.com/help-me-mom/ng-mocks/issues/14900
  describe('injector lookup flags', () => {
    it('forwards SkipSelf options before and after caching a local mock', () => {
      const parent = { echo: () => 'parent' };
      const fallback = { missing: true };
      const options = { skipSelf: true, optional: true };
      const destroyCallbacks: Array<() => void> = [];
      const originalGet = jasmine
        .createSpy('get')
        .and.returnValue(parent);
      const injector = {
        get: originalGet,
        onDestroy: (callback: () => void) =>
          destroyCallbacks.push(callback),
      };

      installRuntimeInject(injector, new Set(), new Set());

      const parentFirst = runRuntimeInject(injector, () =>
        injector.get(TargetService, null, options),
      );

      expect(parentFirst).toBe(parent);
      expect(originalGet).toHaveBeenCalledWith(
        TargetService,
        null,
        options,
      );
      expect(originalGet.calls.mostRecent()?.object).toBe(injector);

      const local = runRuntimeInject(injector, () =>
        injector.get(TargetService),
      );

      expect(local).not.toBe(parent);
      expect(local.echo()).toBeUndefined();
      expect(originalGet).toHaveBeenCalledTimes(1);

      originalGet.and.returnValue(fallback);
      const receiver = {};
      const parentAfterLocal = runRuntimeInject(injector, () =>
        injector.get.call(
          receiver,
          TargetService,
          fallback,
          options,
          'context',
        ),
      );

      expect(parentAfterLocal).toBe(fallback);
      expect(originalGet.calls.mostRecent()?.args).toEqual([
        TargetService,
        fallback,
        options,
        'context',
      ]);
      expect(originalGet.calls.mostRecent()?.object).toBe(receiver);
      expect(originalGet).toHaveBeenCalledTimes(2);

      // SkipSelf must bypass the cache even outside a construction window.
      expect(injector.get(TargetService, fallback, options)).toBe(
        fallback,
      );
      expect(originalGet).toHaveBeenCalledTimes(3);
      expect(injector.get(TargetService)).toBe(local);

      destroyCallbacks[0]();

      expect(injector.get).toBe(originalGet);
    });

    it('forwards numeric SkipSelf flags for cached and uncached tokens', () => {
      class OtherService {
        public echo(): string {
          return 'real other';
        }
      }
      (OtherService as any).ɵprov = { providedIn: 'root' };
      const parent = { echo: () => 'parent' };
      // Angular's legacy InjectFlags: SkipSelf = 4 and Optional = 8.
      const skipSelf = 4;
      const optionalSkipSelf = 12;
      const destroyCallbacks: Array<() => void> = [];
      const originalGet = jasmine
        .createSpy('get')
        .and.returnValue(parent);
      const injector = {
        get: originalGet,
        onDestroy: (callback: () => void) =>
          destroyCallbacks.push(callback),
      };

      installRuntimeInject(injector, new Set(), new Set());

      const local = runRuntimeInject(injector, () =>
        injector.get(TargetService),
      );
      const parentAfterLocal = runRuntimeInject(injector, () =>
        injector.get(TargetService, null, optionalSkipSelf),
      );
      const parentFirst = runRuntimeInject(injector, () =>
        injector.get(OtherService, undefined, skipSelf),
      );

      expect(local.echo()).toBeUndefined();
      expect(parentAfterLocal).toBe(parent);
      expect(parentFirst).toBe(parent);
      expect(originalGet.calls.allArgs()).toEqual([
        [TargetService, null, optionalSkipSelf],
        [OtherService, undefined, skipSelf],
      ]);

      const otherLocal = runRuntimeInject(injector, () =>
        injector.get(OtherService),
      );

      expect(otherLocal).not.toBe(parent);
      expect(otherLocal.echo()).toBeUndefined();
      expect(injector.get(OtherService)).toBe(otherLocal);
      expect(injector.get(TargetService)).toBe(local);
      expect(originalGet).toHaveBeenCalledTimes(2);

      expect(injector.get(TargetService, null, skipSelf)).toBe(
        parent,
      );
      expect(originalGet).toHaveBeenCalledTimes(3);

      destroyCallbacks[0]();

      expect(injector.get).toBe(originalGet);
    });

    it('suspends local mocking during SkipSelf delegation and restores it afterward', () => {
      class ParentService {
        public echo(): string {
          return 'parent';
        }
      }
      (ParentService as any).ɵprov = { providedIn: 'root' };
      const options = { skipSelf: true };
      const destroyCallbacks: Array<() => void> = [];
      const originalGet = jasmine
        .createSpy('get')
        .and.callFake((provide: any): any =>
          provide === ParentService
            ? injector.get(TargetService)
            : new provide(),
        );
      const injector = {
        get: originalGet,
        onDestroy: (callback: () => void) =>
          destroyCallbacks.push(callback),
      };

      installRuntimeInject(injector, new Set(), new Set());

      const { delegated, local } = runRuntimeInject(injector, () => {
        // Dependency resolution inside the original lookup must stay outside this mock scope.
        const delegated = injector.get(ParentService, null, options);
        const local = injector.get(TargetService);

        return { delegated, local };
      });

      expect(delegated.echo()).toBe('real');
      expect(local.echo()).toBeUndefined();
      expect(local).not.toBe(delegated);
      expect(injector.get(TargetService)).toBe(local);
      expect(originalGet.calls.allArgs()).toEqual([
        [ParentService, null, options],
        [TargetService],
      ]);

      destroyCallbacks[0]();
    });

    it('preserves local mock creation and identity for lookups without SkipSelf', () => {
      // Legacy flags: Default = 0, Host = 1, Optional = 8 and Self = 2.
      // Host only affects element injectors, so it preserves this environment lookup.
      for (const flags of [
        undefined,
        0,
        1,
        8,
        2,
        { host: true },
        { optional: true },
        { self: true },
        { skipSelf: false },
      ]) {
        const destroyCallbacks: Array<() => void> = [];
        const originalGet = jasmine.createSpy('get');
        const injector = {
          get: originalGet,
          onDestroy: (callback: () => void) =>
            destroyCallbacks.push(callback),
        };

        installRuntimeInject(injector, new Set(), new Set());

        const local = runRuntimeInject(injector, () =>
          injector.get(TargetService, null, flags),
        );

        expect(local.echo()).toBeUndefined();
        expect(
          runRuntimeInject(injector, () =>
            injector.get(TargetService),
          ),
        ).toBe(local);
        expect(injector.get(TargetService, null, flags)).toBe(local);
        expect(injector.get(TargetService)).toBe(local);
        expect(originalGet).not.toHaveBeenCalled();

        destroyCallbacks[0]();

        expect(injector.get).toBe(originalGet);
      }
    });
  });

  it('restores existing injector and declaration factory descriptors', () => {
    const destroyCallbacks: Array<() => void> = [];
    const originalGet = jasmine
      .createSpy('get')
      .and.callFake((provide: any) => new provide());
    const injector = {
      get: originalGet,
      onDestroy: (callback: () => void) =>
        destroyCallbacks.push(callback),
    };
    const definition = {
      factory: null as null | (() => TargetService),
    };
    const declaration = {
      ɵcmp: definition,
      ɵfac: () => injector.get(TargetService),
    };
    const injectorDescriptor = Object.getOwnPropertyDescriptor(
      injector,
      'get',
    );
    const factoryDescriptor = Object.getOwnPropertyDescriptor(
      definition,
      'factory',
    );

    installRuntimeInject(injector, new Set([declaration]), new Set());

    const service = definition.factory!();
    service.echo();

    expect(service.echo).toHaveBeenCalled();
    expect(injector.get(TargetService)).toBe(service);
    expect(originalGet).not.toHaveBeenCalled();

    destroyCallbacks[0]();

    expect(Object.getOwnPropertyDescriptor(injector, 'get')).toEqual(
      injectorDescriptor,
    );
    expect(
      Object.getOwnPropertyDescriptor(definition, 'factory'),
    ).toEqual(factoryDescriptor);
    expect(injector.get(TargetService)).not.toBe(service);
    expect(originalGet).toHaveBeenCalledTimes(1);
  });

  it('finds its construction window below a nested injector scope', () => {
    const firstDestroyCallbacks: Array<() => void> = [];
    const secondDestroyCallbacks: Array<() => void> = [];
    const firstGet = jasmine
      .createSpy('firstGet')
      .and.callFake((provide: any) => new provide());
    const secondGet = jasmine
      .createSpy('secondGet')
      .and.callFake((provide: any) => new provide());
    const firstInjector = {
      get: firstGet,
      onDestroy: (callback: () => void) =>
        firstDestroyCallbacks.push(callback),
    };
    const secondInjector = {
      get: secondGet,
      onDestroy: (callback: () => void) =>
        secondDestroyCallbacks.push(callback),
    };
    const firstDefinition = {
      factory: null as null | (() => TargetService),
    };
    const secondDefinition = {
      factory: null as null | (() => TargetService),
    };
    const firstDeclaration = {
      ɵcmp: firstDefinition,
      ɵfac: () => secondDefinition.factory!(),
    };
    const secondDeclaration = {
      ɵcmp: secondDefinition,
      ɵfac: () => firstInjector.get(TargetService),
    };

    installRuntimeInject(
      firstInjector,
      new Set([firstDeclaration]),
      new Set(),
    );
    installRuntimeInject(
      secondInjector,
      new Set([secondDeclaration]),
      new Set(),
    );

    const service = firstDefinition.factory!();
    service.echo();

    expect(service.echo).toHaveBeenCalled();
    expect(firstGet).not.toHaveBeenCalled();
    expect(secondGet).not.toHaveBeenCalled();

    secondDestroyCallbacks[0]();
    firstDestroyCallbacks[0]();
  });
});
