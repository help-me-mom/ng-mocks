import { FactoryProvider, Injector, Provider } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';
import { NG_MOCKS_TOUCHES } from '../../common/core.tokens';
import { resetRuntimeInject } from '../../common/ng-mocks-runtime-inject';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { ngMocks } from '../../mock-helper/mock-helper';

import createRuntimeInjectProvider from './create-runtime-inject-provider';

class TargetWithDependencies {}
class TargetWithoutDependencies {}

(TargetWithDependencies as any).ɵprov = { factory: () => undefined };
(TargetWithoutDependencies as any).ɵprov = {
  factory: () => undefined,
};

describe('create-runtime-inject-provider', () => {
  afterEach(() => {
    resetRuntimeInject();
    ngMocksUniverse.builtProviders.delete(TargetWithDependencies);
    ngMocksUniverse.builtProviders.delete(TargetWithoutDependencies);
  });

  it('preserves kept factory providers and their dependencies', () => {
    const withDependencies = {
      deps: ['dependency'],
      provide: TargetWithDependencies,
      useFactory: (dependency: string) => `with:${dependency}`,
    };
    const withoutDependencies = {
      provide: TargetWithoutDependencies,
      useFactory: () => 'without',
    };
    ngMocksUniverse.builtProviders.set(
      TargetWithDependencies,
      withDependencies,
    );
    ngMocksUniverse.builtProviders.set(
      TargetWithoutDependencies,
      withoutDependencies,
    );
    const providers: Provider[] = [
      withDependencies,
      withoutDependencies,
    ];

    createRuntimeInjectProvider(
      new Set([TargetWithDependencies, TargetWithoutDependencies]),
      new Map([
        [TargetWithDependencies, { shallow: false }],
        [TargetWithoutDependencies, { shallow: false }],
      ]),
      providers,
      false,
      new Set(),
    );

    const destroyCallbacks: Array<() => void> = [];
    const injector = {
      get: () => undefined,
      onDestroy: (callback: () => void) =>
        destroyCallbacks.push(callback),
    };
    const withProvider = providers[0] as any;
    const withoutProvider = providers[1] as any;

    expect(withProvider.deps).toEqual([
      Injector,
      NG_MOCKS_TOUCHES,
      'dependency',
    ]);
    expect(
      withProvider.useFactory(injector, new Set(), 'value'),
    ).toBe('with:value');
    expect(withoutProvider.deps).toEqual([
      Injector,
      NG_MOCKS_TOUCHES,
    ]);
    expect(withoutProvider.useFactory(injector, new Set())).toBe(
      'without',
    );

    destroyCallbacks[0]();
  });

  it('preserves kept alias, class, and value provider recipes', () => {
    class AliasTarget {}
    class ClassTarget {}
    class ValueTarget {}
    class Implementation {}
    const deps = ['dependency'];
    const implementation = new Implementation();
    const classFactory = jasmine
      .createSpy('classFactory')
      .and.returnValue(implementation);
    const destroyCallbacks: Array<() => void> = [];
    const value = Object.freeze({ name: 'value' });
    const aliasProvider = Object.freeze({
      provide: AliasTarget,
      useExisting: Implementation,
    });
    const classProvider = Object.freeze({
      deps,
      provide: ClassTarget,
      useClass: Implementation,
    });
    const valueProvider = Object.freeze({
      provide: ValueTarget,
      useValue: value,
    });
    const providers: Provider[] = [
      aliasProvider,
      classProvider,
      valueProvider,
    ];
    Object.freeze(deps);
    for (const def of [AliasTarget, ValueTarget]) {
      coreDefineProperty(def, 'ɵprov', { factory: () => undefined });
    }
    coreDefineProperty(ClassTarget, 'ɵprov', {
      factory: classFactory,
    });
    ngMocksUniverse.builtProviders.set(AliasTarget, aliasProvider);
    ngMocksUniverse.builtProviders.set(ClassTarget, classProvider);
    ngMocksUniverse.builtProviders.set(ValueTarget, valueProvider);

    try {
      createRuntimeInjectProvider(
        new Set([AliasTarget, ClassTarget, ValueTarget]),
        new Map([
          [AliasTarget, { shallow: false }],
          [ClassTarget, { shallow: false }],
          [ValueTarget, { shallow: false }],
        ]),
        providers,
        false,
        new Set(),
      );

      expect(providers[0]).toBe(aliasProvider);
      const wrappedClass = providers[1] as FactoryProvider;
      const injector = {
        get: () => undefined,
        onDestroy: (callback: () => void) =>
          destroyCallbacks.push(callback),
      };
      expect(wrappedClass.provide).toBe(ClassTarget);
      expect(wrappedClass.deps).toEqual([Injector, NG_MOCKS_TOUCHES]);
      expect(wrappedClass.useFactory(injector, new Set())).toBe(
        implementation,
      );
      expect(classFactory).toHaveBeenCalledTimes(1);
      expect(classFactory).toHaveBeenCalledWith();
      expect(providers[2]).toBe(valueProvider);
      expect(aliasProvider.useExisting).toBe(Implementation);
      expect(classProvider.useClass).toBe(Implementation);
      expect(classProvider.deps).toBe(deps);
      expect(deps).toEqual(['dependency']);
      expect(valueProvider.useValue).toBe(value);
    } finally {
      for (const destroy of destroyCallbacks) {
        destroy();
      }
      ngMocksUniverse.builtProviders.delete(AliasTarget);
      ngMocksUniverse.builtProviders.delete(ClassTarget);
      ngMocksUniverse.builtProviders.delete(ValueTarget);
    }
  });

  it('passes the kept child type to its inherited constructor factory', () => {
    const constructed: unknown[] = [];
    class ParentService {
      public readonly name: string = 'parent';

      public constructor() {
        constructed.push(this.constructor);
      }
    }
    class ChildService extends ParentService {
      public readonly name = 'child';
    }
    const constructorFactory = jasmine
      .createSpy('constructorFactory')
      .and.callFake(
        (type: typeof ParentService = ParentService) => new type(),
      );
    coreDefineProperty(ParentService, 'ɵfac', constructorFactory);
    coreDefineProperty(ParentService, 'ɵprov', {
      factory: constructorFactory,
      providedIn: 'root',
      token: ParentService,
    });
    const destroyCallbacks: Array<() => void> = [];
    const injector = {
      get: () => undefined,
      onDestroy: (callback: () => void) =>
        destroyCallbacks.push(callback),
    };
    const providers: Provider[] = [ChildService];
    ngMocksUniverse.builtProviders.set(ChildService, ChildService);

    try {
      createRuntimeInjectProvider(
        new Set([ChildService]),
        new Map([[ChildService, { shallow: false }]]),
        providers,
        false,
        new Set(),
      );

      const wrapped = providers[0] as FactoryProvider;
      expect(wrapped.provide).toBe(ChildService);
      expect(wrapped.deps).toEqual([Injector, NG_MOCKS_TOUCHES]);
      expect(constructorFactory).not.toHaveBeenCalled();
      expect(constructed).toEqual([]);

      const service = wrapped.useFactory(injector, new Set());

      expect(service instanceof ChildService).toBe(true);
      expect(service.name).toBe('child');
      expect(constructorFactory).toHaveBeenCalledTimes(1);
      expect(constructorFactory).toHaveBeenCalledWith(ChildService);
      expect(service).toBe(
        constructorFactory.calls.mostRecent().returnValue,
      );
      expect(constructed).toEqual([ChildService]);
      expect(ngMocksUniverse.builtProviders.get(ChildService)).toBe(
        ChildService,
      );
    } finally {
      for (const destroy of destroyCallbacks) {
        destroy();
      }
      ngMocksUniverse.builtProviders.delete(ChildService);
    }
  });

  describe('explicit keeps in default auto-spy mode', () => {
    beforeEach(() => ngMocks.autoSpy('default'));
    afterEach(() => ngMocks.autoSpy('reset'));

    it('preserves a keep snapshot when a kept service installs runtime injection', () => {
      class KeptDependency {
        public echo(): string {
          return 'real';
        }
      }
      class MockedDependency {
        public echo(): string {
          return 'real';
        }
      }
      (KeptDependency as any).ɵprov = { providedIn: 'root' };
      (MockedDependency as any).ɵprov = { providedIn: 'root' };
      const destroyCallbacks: Array<() => void> = [];
      const originalGet = jasmine
        .createSpy('get')
        .and.callFake((provide: any) => new provide());
      const injector = {
        get: originalGet,
        onDestroy: (callback: () => void) =>
          destroyCallbacks.push(callback),
      };
      const provider = {
        provide: TargetWithDependencies,
        useFactory: () => ({
          kept: injector.get(KeptDependency),
          mocked: injector.get(MockedDependency),
        }),
      };
      ngMocksUniverse.builtProviders.set(
        TargetWithDependencies,
        provider,
      );
      const providers: Provider[] = [provider];
      const keepDef = new Set<any>([
        TargetWithDependencies,
        KeptDependency,
      ]);

      createRuntimeInjectProvider(
        keepDef,
        new Map<any, any>([
          [TargetWithDependencies, { shallow: false }],
          [KeptDependency, { dependency: true }],
        ]),
        providers,
        false,
        new Set(),
      );

      // A root dependency can be kept without a generated provider or touches entry.
      keepDef.clear();
      keepDef.add(MockedDependency);
      const touches = new Set([TargetWithDependencies]);
      const service = (providers[0] as any).useFactory(
        injector,
        touches,
      );

      expect(providers.length).toBe(1);
      expect(service.kept.echo()).toEqual('real');
      expect(service.mocked.echo()).toBeUndefined();
      expect(injector.get(MockedDependency)).toBe(service.mocked);
      expect(originalGet).toHaveBeenCalledTimes(1);
      expect(originalGet).toHaveBeenCalledWith(KeptDependency);
      expect(touches).toEqual(new Set([TargetWithDependencies]));

      destroyCallbacks[0]();
    });

    it('preserves a keep snapshot when a declaration initializer installs runtime injection', () => {
      class KeptDependency {
        public echo(): string {
          return 'real';
        }
      }
      class MockedDependency {
        public echo(): string {
          return 'real';
        }
      }
      (KeptDependency as any).ɵprov = { providedIn: 'root' };
      (MockedDependency as any).ɵprov = { providedIn: 'root' };
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
        factory: null as
          | null
          | (() => {
              kept: KeptDependency;
              mocked: MockedDependency;
            }),
      };
      class TargetDirective {}
      (TargetDirective as any).__annotations__ = [
        { ngMetadataName: 'Directive', standalone: false },
      ];
      (TargetDirective as any).ɵdir = definition;
      (TargetDirective as any).ɵfac = () => ({
        kept: injector.get(KeptDependency),
        mocked: injector.get(MockedDependency),
      });
      const keepDef = new Set<any>([TargetDirective, KeptDependency]);
      const providers: Provider[] = [];
      const provider = createRuntimeInjectProvider(
        keepDef,
        new Map<any, any>([
          [TargetDirective, { shallow: false }],
          [KeptDependency, { dependency: true }],
        ]),
        providers,
        true,
        new Set(),
      ) as any;

      keepDef.clear();
      keepDef.add(MockedDependency);
      const touches = new Set([TargetDirective]);
      provider.useFactory(injector, touches)();
      const directive = definition.factory!();

      expect(providers).toEqual([]);
      expect(directive.kept.echo()).toEqual('real');
      expect(directive.mocked.echo()).toBeUndefined();
      expect(injector.get(MockedDependency)).toBe(directive.mocked);
      expect(originalGet).toHaveBeenCalledTimes(1);
      expect(originalGet).toHaveBeenCalledWith(KeptDependency);
      expect(touches).toEqual(new Set([TargetDirective]));

      destroyCallbacks[0]();
    });
  });

  describe('explicit exclusions in default auto-spy mode', () => {
    beforeEach(() => ngMocks.autoSpy('default'));
    afterEach(() => ngMocks.autoSpy('reset'));

    it('preserves an exclusion snapshot when a kept service installs runtime injection', () => {
      class ExcludedDependency {
        public echo(): string {
          return 'real';
        }
      }
      class MockedDependency {
        public echo(): string {
          return 'real';
        }
      }
      (ExcludedDependency as any).ɵprov = { providedIn: 'root' };
      (MockedDependency as any).ɵprov = { providedIn: 'root' };
      const destroyCallbacks: Array<() => void> = [];
      const originalGet = jasmine
        .createSpy('get')
        .and.callFake((provide: any) => new provide());
      const injector = {
        get: originalGet,
        onDestroy: (callback: () => void) =>
          destroyCallbacks.push(callback),
      };
      const provider = {
        provide: TargetWithDependencies,
        useFactory: () => ({
          excluded: injector.get(ExcludedDependency),
          mocked: injector.get(MockedDependency),
        }),
      };
      ngMocksUniverse.builtProviders.set(
        TargetWithDependencies,
        provider,
      );
      const providers: Provider[] = [provider];
      const excludeDef = new Set<any>([ExcludedDependency]);

      createRuntimeInjectProvider(
        new Set([TargetWithDependencies]),
        new Map([[TargetWithDependencies, { shallow: false }]]),
        providers,
        false,
        excludeDef,
      );

      // Later builder changes must not change the already-created runtime provider.
      excludeDef.clear();
      excludeDef.add(MockedDependency);
      const touches = new Set([TargetWithDependencies]);
      const service = (providers[0] as any).useFactory(
        injector,
        touches,
      );

      expect(service.excluded.echo()).toEqual('real');
      expect(service.mocked.echo()).toBeUndefined();
      expect(injector.get(MockedDependency)).toBe(service.mocked);
      expect(originalGet).toHaveBeenCalledTimes(1);
      expect(originalGet).toHaveBeenCalledWith(ExcludedDependency);
      expect(touches).toEqual(new Set([TargetWithDependencies]));

      destroyCallbacks[0]();
    });

    it('preserves an exclusion snapshot when a declaration initializer installs runtime injection', () => {
      class ExcludedDependency {
        public echo(): string {
          return 'real';
        }
      }
      class MockedDependency {
        public echo(): string {
          return 'real';
        }
      }
      (ExcludedDependency as any).ɵprov = { providedIn: 'root' };
      (MockedDependency as any).ɵprov = { providedIn: 'root' };
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
        factory: null as
          | null
          | (() => {
              excluded: ExcludedDependency;
              mocked: MockedDependency;
            }),
      };
      class TargetDirective {}
      (TargetDirective as any).__annotations__ = [
        { ngMetadataName: 'Directive', standalone: false },
      ];
      (TargetDirective as any).ɵdir = definition;
      (TargetDirective as any).ɵfac = () => ({
        excluded: injector.get(ExcludedDependency),
        mocked: injector.get(MockedDependency),
      });
      const excludeDef = new Set<any>([ExcludedDependency]);
      const provider = createRuntimeInjectProvider(
        new Set([TargetDirective]),
        new Map([[TargetDirective, { shallow: false }]]),
        [],
        true,
        excludeDef,
      ) as any;

      excludeDef.clear();
      excludeDef.add(MockedDependency);
      const touches = new Set([TargetDirective]);
      provider.useFactory(injector, touches)();
      const directive = definition.factory!();

      expect(directive.excluded.echo()).toEqual('real');
      expect(directive.mocked.echo()).toBeUndefined();
      expect(injector.get(MockedDependency)).toBe(directive.mocked);
      expect(originalGet).toHaveBeenCalledTimes(1);
      expect(originalGet).toHaveBeenCalledWith(ExcludedDependency);
      expect(touches).toEqual(new Set([TargetDirective]));

      destroyCallbacks[0]();
    });
  });
});
