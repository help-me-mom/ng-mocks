import {
  installRuntimeInject,
  resetRuntimeInject,
} from './ng-mocks-runtime-inject';

class TargetService {
  public echo(): string {
    return 'real';
  }
}

(TargetService as any).ɵprov = { providedIn: 'root' };

describe('ng-mocks-runtime-inject', () => {
  afterEach(() => resetRuntimeInject());

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
