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
