import { FactoryProvider } from '@angular/core';

import coreDefineProperty from '../../common/core.define-property';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder-stash';

import initNgModules from './init-ng-modules';
import { BuilderData } from './types';

// @see https://github.com/help-me-mom/ng-mocks/issues/14949
describe('init-ng-modules', () => {
  const stash = new MockBuilderStash();
  let data: BuilderData;

  beforeEach(() => {
    stash.backup();
    data = {
      configDef: ngMocksUniverse.config,
      configDefault: {},
      defProviders: new Map(),
      defValue: new Map(),
      excludeDef: new Set(),
      keepDef: new Set(),
      mockDef: new Set(),
      providerDef: new Map(),
      replaceDef: new Set(),
    };
  });
  afterEach(() => stash.restore());

  for (const field of ['ɵprov', 'ngInjectableDef']) {
    it(`retains an own root ${field} factory without invoking it during emission`, () => {
      class TargetService {}
      const value = Object.freeze({ value: 'native' });
      const factory = jasmine
        .createSpy('nativeFactory')
        .and.returnValue(value);
      // Angular 6's legacy definition does not include the token field.
      const definition = Object.freeze({
        factory,
        providedIn: 'root',
        ...(field === 'ɵprov' ? { token: TargetService } : {}),
      });
      coreDefineProperty(TargetService, field, definition);
      data.keepDef.add(TargetService);
      ngMocksUniverse.config.set(TargetService, { export: true });
      ngMocksUniverse.builtProviders.set(
        TargetService,
        TargetService,
      );

      const module = initNgModules(data, new Map());

      expect(factory).not.toHaveBeenCalled();
      expect(module.providers.length).toBe(1);
      const provider = module.providers[0] as FactoryProvider;
      expect(provider.provide).toBe(TargetService);
      expect(provider.useFactory()).toBe(value);
      expect(factory).toHaveBeenCalledTimes(1);
      expect(factory).toHaveBeenCalledWith();
      expect(
        Object.getOwnPropertyDescriptor(TargetService, field)?.value,
      ).toBe(definition);
      expect(module.imports).toEqual([]);
      expect(module.declarations).toEqual([]);
    });
  }

  it('leaves non-root native definitions as class providers', () => {
    class ProviderModule {}
    const factory = jasmine.createSpy('nativeFactory');

    for (const field of ['ɵprov', 'ngInjectableDef']) {
      for (const providedIn of [
        undefined,
        null,
        'platform',
        'any',
        ProviderModule,
      ]) {
        class TargetService {}
        coreDefineProperty(TargetService, field, {
          factory,
          providedIn,
          token: TargetService,
        });
        data.keepDef.clear();
        data.keepDef.add(TargetService);
        ngMocksUniverse.config.set(TargetService, { export: true });
        ngMocksUniverse.builtProviders.set(
          TargetService,
          TargetService,
        );

        const module = initNgModules(data, new Map());

        expect(module.providers).toEqual([TargetService]);
        expect(
          ngMocksUniverse.builtProviders.get(TargetService),
        ).toBe(TargetService);
        expect(factory).not.toHaveBeenCalled();
      }
    }
  });

  it('keeps an own legacy recipe when the class prototype has no parent', () => {
    class TargetService extends null {}
    const value = Object.freeze({ name: 'parentless' });
    const factory = jasmine
      .createSpy('nativeFactory')
      .and.returnValue(value);
    coreDefineProperty(TargetService, 'ngInjectableDef', {
      factory,
      providedIn: 'root',
    });
    data.keepDef.add(TargetService);
    ngMocksUniverse.config.set(TargetService, { export: true });
    ngMocksUniverse.builtProviders.set(TargetService, TargetService);

    const module = initNgModules(data, new Map());

    expect(factory).not.toHaveBeenCalled();
    expect(module.providers.length).toBe(1);
    const provider = module.providers[0] as FactoryProvider;
    expect(provider.provide).toBe(TargetService);
    expect(provider.useFactory()).toBe(value);
    expect(factory).toHaveBeenCalledTimes(1);
    expect(factory).toHaveBeenCalledWith();
  });

  it('does not substitute inherited or copied parent injectable factories', () => {
    class ModernParent {}
    class ModernChild extends ModernParent {}
    class CopiedChild extends ModernParent {}
    class LegacyParent {}
    class LegacyChild extends LegacyParent {}
    class CopiedLegacyChild extends LegacyParent {}
    const factory = jasmine.createSpy('parentFactory');
    const definition = Object.freeze({
      factory,
      providedIn: 'root',
      token: ModernParent,
    });
    coreDefineProperty(ModernParent, 'ɵprov', definition);
    // Older static inheritance implementations can copy a definition onto the child.
    coreDefineProperty(CopiedChild, 'ɵprov', definition);
    coreDefineProperty(LegacyParent, 'ngInjectableDef', {
      factory,
      providedIn: 'root',
    });
    coreDefineProperty(
      CopiedLegacyChild,
      'ngInjectableDef',
      Object.getOwnPropertyDescriptor(LegacyParent, 'ngInjectableDef')
        ?.value,
    );
    for (const target of [
      ModernChild,
      CopiedChild,
      LegacyChild,
      CopiedLegacyChild,
    ]) {
      data.keepDef.add(target);
      ngMocksUniverse.config.set(target, { export: true });
      ngMocksUniverse.builtProviders.set(target, target);
    }

    const module = initNgModules(data, new Map());

    expect(module.providers).toEqual([
      ModernChild,
      CopiedChild,
      LegacyChild,
      CopiedLegacyChild,
    ]);
    expect(
      Object.getOwnPropertyDescriptor(ModernChild, 'ɵprov'),
    ).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(LegacyChild, 'ngInjectableDef'),
    ).toBeUndefined();
    expect(factory).not.toHaveBeenCalled();
    for (const target of [
      ModernChild,
      CopiedChild,
      LegacyChild,
      CopiedLegacyChild,
    ]) {
      expect(ngMocksUniverse.builtProviders.get(target)).toBe(target);
    }
  });

  it('preserves already selected provider objects and their dependency identities', () => {
    class TargetService {}
    class Implementation {}
    const value = Object.freeze({ value: 'provided' });
    const deps = ['dependency'];
    Object.freeze(deps);
    const factory = jasmine.createSpy('nativeFactory');
    const selectedFactory = jasmine.createSpy('selectedFactory');
    coreDefineProperty(TargetService, 'ɵprov', {
      factory,
      providedIn: 'root',
      token: TargetService,
    });
    data.keepDef.add(TargetService);
    ngMocksUniverse.config.set(TargetService, { export: true });

    for (const provider of [
      Object.freeze({ provide: TargetService, useValue: value }),
      Object.freeze({
        provide: TargetService,
        useExisting: Implementation,
      }),
      Object.freeze({
        provide: TargetService,
        useClass: Implementation,
        deps,
      }),
      Object.freeze({
        provide: TargetService,
        useFactory: selectedFactory,
        deps,
      }),
    ]) {
      ngMocksUniverse.configInstance.delete(TargetService);
      ngMocksUniverse.builtProviders.set(TargetService, provider);

      const module = initNgModules(data, new Map());

      expect(module.providers.length).toBe(1);
      expect(module.providers[0]).toBe(provider);
      expect(ngMocksUniverse.builtProviders.get(TargetService)).toBe(
        provider,
      );
      if ('deps' in provider) {
        expect(provider.deps).toBe(deps);
      }
      expect(factory).not.toHaveBeenCalled();
      expect(selectedFactory).not.toHaveBeenCalled();
    }
    expect(deps).toEqual(['dependency']);
  });

  it('leaves classes with absent or non-callable native factories unchanged', () => {
    class PlainService {}
    class MissingFactory {}
    class NonCallableFactory {}
    coreDefineProperty(MissingFactory, 'ɵprov', {
      providedIn: 'root',
      token: MissingFactory,
    });
    coreDefineProperty(NonCallableFactory, 'ngInjectableDef', {
      factory: 'not a factory',
      providedIn: 'root',
    });
    for (const target of [
      PlainService,
      MissingFactory,
      NonCallableFactory,
    ]) {
      data.keepDef.add(target);
      ngMocksUniverse.config.set(target, { export: true });
      ngMocksUniverse.builtProviders.set(target, target);
    }

    const module = initNgModules(data, new Map());

    expect(module.providers).toEqual([
      PlainService,
      MissingFactory,
      NonCallableFactory,
    ]);
    for (const target of [
      PlainService,
      MissingFactory,
      NonCallableFactory,
    ]) {
      expect(ngMocksUniverse.builtProviders.get(target)).toBe(target);
    }
  });
});
