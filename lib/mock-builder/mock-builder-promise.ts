import { Directive, InjectionToken, ModuleWithProviders, NgModule, Provider, ValueProvider } from '@angular/core';
import { MetadataOverride, TestBed } from '@angular/core/testing';

import { extractDependency, flatten, mapEntries, mapValues } from '../common/core.helpers';
import { directiveResolver, jitReflector } from '../common/core.reflect';
import { NG_MOCKS, NG_MOCKS_OVERRIDES, NG_MOCKS_ROOT_PROVIDERS, NG_MOCKS_TOUCHES } from '../common/core.tokens';
import { Type } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';
import { isNgInjectionToken } from '../common/func.is-ng-injection-token';
import { isNgModuleDefWithProviders, NgModuleWithProviders } from '../common/func.is-ng-module-def-with-providers';
import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { ngMocks } from '../mock-helper/mock-helper';
import { MockModule, MockNgDef } from '../mock-module/mock-module';
import { MockPipe } from '../mock-pipe/mock-pipe';
import helperMockService from '../mock-service/helper.mock-service';
import mockProvider from '../mock-service/mock-provider';
import { MockService } from '../mock-service/mock-service';

import mockBuilderPromiseExtractDep from './mock-builder-promise.extract-dep';
import mockBuilderPromiseSkipDep from './mock-builder-promise.skip-dep';
import { MockBuilderStash } from './mock-builder-stash';
import { IMockBuilder, IMockBuilderConfig, IMockBuilderResult } from './types';

type BuilderData = {
  configDef: Map<Type<any> | InjectionToken<any>, any>;
  defProviders: Map<Type<any> | InjectionToken<any>, Provider[]>;
  defValue: Map<Type<any> | InjectionToken<any>, any>;
  excludeDef: Set<Type<any> | InjectionToken<any>>;
  keepDef: Set<Type<any> | InjectionToken<any>>;
  mockDef: Set<Type<any> | InjectionToken<any>>;
  providerDef: Map<Type<any> | InjectionToken<any>, Provider>;
  replaceDef: Set<Type<any> | InjectionToken<any>>;
};

type NgMeta = {
  declarations: Array<Type<any>>;
  imports: Array<Type<any> | NgModuleWithProviders>;
  providers: Provider[];
};

const createNgMocksToken = (): ValueProvider => {
  const mocks = new Map();
  for (const [key, value] of [
    ...mapEntries(ngMocksUniverse.builtProviders),
    ...mapEntries(ngMocksUniverse.builtDeclarations),
    ...mapEntries(ngMocksUniverse.cacheDeclarations),
    ...mapEntries(ngMocksUniverse.cacheProviders),
  ]) {
    if (mocks.has(key)) {
      continue;
    }
    mocks.set(key, value);
  }

  return {
    provide: NG_MOCKS,
    useValue: mocks,
  };
};

const createNgMocksTouchesToken = (): ValueProvider => {
  // Redefining providers for kept declarations.
  const touches = new Set();
  for (const proto of mapValues(ngMocksUniverse.touches)) {
    const source: any = proto;
    let value = ngMocksUniverse.builtDeclarations.get(source);

    // kept declarations should be based on their source.
    if (value === undefined) {
      value = source;
    }

    touches.add(source);
    touches.add(value);
  }

  return {
    provide: NG_MOCKS_TOUCHES,
    useValue: touches,
  };
};

const skipOverride = (
  replaceDef: BuilderData['replaceDef'],
  defValue: BuilderData['defValue'],
  source: any,
  value: any,
): boolean => {
  // no reason to touch mocks
  if (ngMocksUniverse.cacheDeclarations.has(value)) {
    return true;
  }

  // no customizations in replacements
  if (replaceDef.has(source) && value === defValue.get(source)) {
    return true;
  }

  return false;
};

const getOverrideMeta = (value: any): Directive | undefined => {
  if (isNgDef(value, 'c')) {
    return directiveResolver.resolve(value);
  }
  if (isNgDef(value, 'd')) {
    return directiveResolver.resolve(value);
  }

  return undefined;
};

const getOverrideDef = (meta?: Directive): NgModule | undefined => {
  if (!meta) {
    return undefined;
  }

  const skipMock = ngMocksUniverse.flags.has('skipMock');
  // istanbul ignore else
  if (!skipMock) {
    ngMocksUniverse.flags.add('skipMock');
  }
  const [changed, def] = MockNgDef({ providers: meta.providers });
  // istanbul ignore else
  if (!skipMock) {
    ngMocksUniverse.flags.delete('skipMock');
  }
  if (!changed) {
    return undefined;
  }

  return def;
};

const createNgMocksOverridesToken = (replaceDef: Set<any>, defValue: Map<any, any>): ValueProvider => {
  const overrides: Map<Type<any>, MetadataOverride<any>> = new Map();
  for (const proto of mapValues(ngMocksUniverse.touches)) {
    const source: any = proto;
    const value = ngMocksUniverse.builtDeclarations.get(source) || source;
    if (skipOverride(replaceDef, defValue, source, value)) {
      continue;
    }

    const def = getOverrideDef(getOverrideMeta(value));
    if (!def) {
      continue;
    }
    const override: MetadataOverride<NgModule> = {
      set: def,
    };
    overrides.set(value, override);
  }

  return {
    provide: NG_MOCKS_OVERRIDES,
    useValue: overrides,
  };
};

const initKeepDef = (keepDef: Set<any>): void => {
  for (const def of mapValues(keepDef)) {
    ngMocksUniverse.builtDeclarations.set(def, def);
    ngMocksUniverse.builtProviders.set(def, def);
    ngMocksUniverse.config.get('resolution').set(def, 'keep');
  }
};

const initReplaceDef = (replaceDef: Set<any>, defValue: Map<any, any>): void => {
  for (const def of mapValues(replaceDef)) {
    ngMocksUniverse.builtDeclarations.set(def, defValue.get(def));
    ngMocksUniverse.config.get('resolution').set(def, 'replace');
  }
};

const initExcludeDef = (excludeDef: Set<any>): void => {
  for (const def of [...mapValues(excludeDef)]) {
    ngMocksUniverse.builtDeclarations.set(def, null);
    ngMocksUniverse.builtProviders.set(def, null);
    ngMocksUniverse.config.get('resolution').set(def, 'exclude');
  }
};

const tryMockDeclaration = (def: any, defValue: Map<any, any>): void => {
  if (isNgDef(def, 'c')) {
    ngMocksUniverse.builtDeclarations.set(def, MockComponent(def));
  }
  if (isNgDef(def, 'd')) {
    ngMocksUniverse.builtDeclarations.set(def, MockDirective(def));
  }
  if (isNgDef(def, 'p')) {
    const instance = defValue.get(def);
    ngMocksUniverse.builtDeclarations.set(
      def,
      typeof instance === 'function'
        ? MockPipe(def, instance)
        : instance && typeof instance === 'object' && typeof instance.transform === 'function'
        ? MockPipe(def, instance.transform)
        : MockPipe(def),
    );
  }
};

const tryMockProvider = (def: any, defValue: Map<any, any>): void => {
  if (isNgDef(def, 'i') && defValue.has(def)) {
    const instance = defValue.get(def);
    const isFunc = isNgDef(def, 'p') && typeof instance === 'function';
    ngMocksUniverse.builtProviders.set(
      def,
      helperMockService.useFactory(def, () =>
        isFunc ? ngMocks.stub(MockService(def), { transform: instance }) : instance,
      ),
    );
  } else if (isNgDef(def, 'i')) {
    ngMocksUniverse.builtProviders.set(def, mockProvider(def));
  }

  if (!isNgDef(def) && defValue.has(def)) {
    const instance = defValue.get(def);
    ngMocksUniverse.builtProviders.set(
      def,
      helperMockService.useFactory(def, () => instance),
    );
  } else if (!isNgDef(def)) {
    ngMocksUniverse.builtProviders.set(def, mockProvider(def));
  }
};

const initMockDeclarations = (mockDef: Set<any>, defValue: Map<any, any>): void => {
  for (const def of mapValues(mockDef)) {
    ngMocksUniverse.config.get('resolution').set(def, 'mock');
    tryMockDeclaration(def, defValue);
    tryMockProvider(def, defValue);

    ngMocksUniverse.touches.delete(def);
  }
};

const initModules = (
  keepDef: Set<any>,
  mockDef: Set<any>,
  replaceDef: Set<any>,
  defProviders: Map<any, any>,
): Map<any, any> => {
  const loProviders = new Map();

  for (const def of [...mapValues(keepDef), ...mapValues(mockDef), ...mapValues(replaceDef)]) {
    if (!isNgDef(def, 'm')) {
      continue;
    }

    if (defProviders.has(def) && mockDef.has(def)) {
      const [, loDef] = MockNgDef({ providers: defProviders.get(def) });
      loProviders.set(def, loDef.providers);
    } else if (defProviders.has(def)) {
      loProviders.set(def, defProviders.get(def));
    }

    ngMocksUniverse.builtDeclarations.set(def, MockModule(def));
    ngMocksUniverse.touches.delete(def);
  }

  return loProviders;
};

const initUniverse = ({
  configDef,
  defProviders,
  defValue,
  excludeDef,
  keepDef,
  mockDef,
  replaceDef,
}: BuilderData): Map<any, any> => {
  ngMocksUniverse.flags.add('cachePipe');

  ngMocksUniverse.config.set('multi', new Set()); // collecting multi flags of providers.
  ngMocksUniverse.config.set('deps', new Set()); // collecting all deps of providers.
  ngMocksUniverse.config.set('depsSkip', new Set()); // collecting all declarations of kept modules.
  ngMocksUniverse.config.set('resolution', new Map()); // flags to understand how to mock nested declarations.
  for (const [k, v] of mapEntries(configDef)) {
    ngMocksUniverse.config.set(k, v);
  }
  initKeepDef(keepDef);
  initReplaceDef(replaceDef, defValue);
  initExcludeDef(excludeDef);
  initMockDeclarations(mockDef, defValue);

  return initModules(keepDef, mockDef, replaceDef, defProviders);
};

const skipInitModule = (def: any, configDef: BuilderData['configDef']): boolean => {
  if (isNgDef(def, 'i') || !isNgDef(def)) {
    return true;
  }
  if (ngMocksUniverse.touches.has(def)) {
    return true;
  }

  const config = configDef.get(def);

  return config && config.dependency;
};

const initModule = (
  def: Type<any>,
  defProviders: BuilderData['defProviders'],
): Type<any> | ModuleWithProviders<any> => {
  const loModule = ngMocksUniverse.builtDeclarations.get(def);
  const loProviders = defProviders.has(def) ? defProviders.get(def) : undefined;

  return loProviders
    ? {
        ngModule: loModule,
        providers: loProviders,
      }
    : loModule;
};

const initNgModules = (
  { configDef, keepDef, mockDef, replaceDef }: BuilderData,
  defProviders: Map<any, any>,
): NgMeta => {
  const { imports, declarations, providers }: NgMeta = { imports: [], declarations: [], providers: [] };

  // Adding suitable leftovers.
  for (const def of [...mapValues(mockDef), ...mapValues(keepDef), ...mapValues(replaceDef)]) {
    if (skipInitModule(def, configDef)) {
      continue;
    }

    if (isNgDef(def, 'm')) {
      imports.push(initModule(def, defProviders));
    } else {
      declarations.push(ngMocksUniverse.builtDeclarations.get(def));
    }

    ngMocksUniverse.touches.add(def);
  }

  return {
    declarations,
    imports,
    providers,
  };
};

const addMissedKeepDeclarationsAndModules = (ngModule: NgMeta, { keepDef, configDef }: BuilderData): void => {
  // Adding missed kept providers to test bed.
  for (const def of mapValues(keepDef)) {
    if (!isNgDef(def, 'i') && isNgDef(def)) {
      continue;
    }

    if (ngMocksUniverse.touches.has(def)) {
      continue;
    }

    const config = configDef.get(def);
    if (config && config.dependency) {
      continue;
    }

    if (isNgInjectionToken(def)) {
      ngMocksUniverse.touches.add(def);
      continue;
    }
    ngModule.providers.push(def);
    ngMocksUniverse.touches.add(def);
  }
};

const addMissedMockDeclarationsAndModules = (ngModule: NgMeta, { mockDef, configDef }: BuilderData): void => {
  // Adding missed mock providers to test bed.
  for (const def of mapValues(mockDef)) {
    if (!isNgDef(def, 'i') && isNgDef(def)) {
      continue;
    }

    if (ngMocksUniverse.touches.has(def)) {
      continue;
    }

    const config = configDef.get(def);
    if (config && config.dependency) {
      continue;
    }

    const mock = ngMocksUniverse.builtProviders.get(def);
    ngModule.providers.push(mock || { provide: def, useValue: undefined });
    ngMocksUniverse.touches.add(def);
  }
};

const addRequestedProviders = (ngModule: NgMeta, { providerDef }: BuilderData): void => {
  // Adding requested providers to test bed.
  for (const provider of mapValues(providerDef)) {
    ngModule.providers.push(provider);
  }

  // Analyzing providers.
  for (const provider of flatten(ngModule.providers)) {
    const provide = typeof provider === 'object' && (provider as any).provide ? (provider as any).provide : provider;
    ngMocksUniverse.touches.add(provide);

    if (provide !== provider && (provider as any).deps) {
      extractDependency((provider as any).deps, ngMocksUniverse.config.get('deps'));
    }
  }
};

const getRootProvidersData = (): {
  buckets: any[];
  touched: any[];
} => {
  // We need buckets here to process first all depsSkip, then deps and only after that all other defs.
  const buckets: any[] = [
    mapValues(ngMocksUniverse.config.get('depsSkip')),
    mapValues(ngMocksUniverse.config.get('deps')),
    mapValues(ngMocksUniverse.touches),
  ];

  // Also we need to track what has been touched to check params recursively, but avoiding duplicates.
  const touched: any[] = [].concat(...buckets);

  return {
    buckets,
    touched,
  };
};

const addDefToRootProviderParameters = (parameters: Set<any>, mockDef: BuilderData['mockDef'], def: any): void => {
  if (!mockBuilderPromiseSkipDep(def)) {
    if (mockDef.has(NG_MOCKS_ROOT_PROVIDERS) || !ngMocksUniverse.config.get('depsSkip').has(def)) {
      parameters.add(def);
    }
  }
};

const skipRootProviderDependency = (provide: any): boolean => {
  if (mockBuilderPromiseSkipDep(provide)) {
    return true;
  }

  return ngMocksUniverse.config.get('depsSkip').has(provide);
};

const checkRootProviderDependency = (provide: any, bucket: any[], touched: any[]): void => {
  if (typeof provide === 'function' && touched.indexOf(provide) === -1) {
    touched.push(provide);
    bucket.push(provide);
  }
};

const getRootProviderParameters = (mockDef: BuilderData['mockDef']): Set<any> => {
  const parameters = new Set();
  const { buckets, touched } = getRootProvidersData();

  for (const bucket of buckets) {
    for (const def of bucket) {
      addDefToRootProviderParameters(parameters, mockDef, def);

      for (const decorators of jitReflector.parameters(def)) {
        const provide: any = mockBuilderPromiseExtractDep(decorators);
        if (skipRootProviderDependency(provide)) {
          continue;
        }
        checkRootProviderDependency(provide, touched, bucket);
        if (mockDef.has(NG_MOCKS_ROOT_PROVIDERS) || !ngMocksUniverse.config.get('depsSkip').has(def)) {
          parameters.add(provide);
        } else {
          ngMocksUniverse.config.get('depsSkip').add(provide);
        }
      }
    }
  }

  return parameters;
};

// Mocking root providers.
const handleRootProviders = (ngModule: NgMeta, { keepDef, mockDef }: BuilderData): void => {
  // Adding missed providers.
  const parameters = keepDef.has(NG_MOCKS_ROOT_PROVIDERS) ? new Set() : getRootProviderParameters(mockDef);
  if (parameters.size) {
    const parametersMap = new Map();
    for (const parameter of mapValues(parameters)) {
      const mock = helperMockService.resolveProvider(parameter, parametersMap);
      if (mock) {
        ngModule.providers.push(mock);
      } else if (isNgInjectionToken(parameter)) {
        const multi = ngMocksUniverse.config.has('multi') && ngMocksUniverse.config.get('multi').has(parameter);
        ngModule.providers.push(helperMockService.useFactory(parameter, () => (multi ? [] : undefined)));
      }
    }
  }
};

const defaultMock = {}; // simulating Symbol

export class MockBuilderPromise implements IMockBuilder {
  public readonly [Symbol.toStringTag] = 'MockBuilder';
  protected beforeCC: Set<(testBed: typeof TestBed) => void> = new Set();
  protected configDef: BuilderData['configDef'] = new Map();
  protected defProviders: BuilderData['defProviders'] = new Map();
  protected defValue: BuilderData['defValue'] = new Map();
  protected excludeDef: BuilderData['excludeDef'] = new Set();
  protected keepDef: BuilderData['keepDef'] = new Set();
  protected mockDef: BuilderData['mockDef'] = new Set();
  protected providerDef: BuilderData['providerDef'] = new Map();
  protected replaceDef: BuilderData['replaceDef'] = new Set();
  protected stash: MockBuilderStash = new MockBuilderStash();

  public beforeCompileComponents(callback: (testBed: typeof TestBed) => void): this {
    this.beforeCC.add(callback);

    return this;
  }

  public build(): NgModule {
    this.stash.backup();

    const params = this.combineParams();

    const ngModule = initNgModules(params, initUniverse(params));
    addMissedKeepDeclarationsAndModules(ngModule, params);
    addMissedMockDeclarationsAndModules(ngModule, params);
    addRequestedProviders(ngModule, params);
    handleRootProviders(ngModule, params);

    ngModule.providers.push(createNgMocksToken());
    ngModule.providers.push(createNgMocksTouchesToken());
    ngModule.providers.push(createNgMocksOverridesToken(this.replaceDef, this.defValue));

    this.stash.restore();

    return ngModule;
  }

  // istanbul ignore next
  public async catch(reject?: ((reason: any) => PromiseLike<never>) | undefined | null): Promise<IMockBuilderResult> {
    return this.then().catch(reject);
  }

  public exclude(def: any): this {
    this.wipe(def);
    this.excludeDef.add(def);

    return this;
  }

  // istanbul ignore next
  public async finally(callback?: (() => void) | null | undefined): Promise<IMockBuilderResult> {
    return this.then().finally(callback);
  }

  public keep(input: any, config?: IMockBuilderConfig): this {
    const { def, providers } = isNgModuleDefWithProviders(input)
      ? { def: input.ngModule, providers: input.providers }
      : { def: input, providers: undefined };

    const existing = this.keepDef.has(def) ? this.defProviders.get(def) : [];
    this.wipe(def);
    this.keepDef.add(def);

    // a magic to support modules with providers.
    if (providers) {
      this.defProviders.set(def, [...(existing || /* istanbul ignore next */ []), ...providers]);
    }

    if (config) {
      this.configDef.set(def, config);
    } else {
      this.configDef.delete(def);
    }

    return this;
  }

  public mock(input: any, a1: any = defaultMock, a2?: any): this {
    const { def, providers } = isNgModuleDefWithProviders(input)
      ? { def: input.ngModule, providers: input.providers }
      : { def: input, providers: undefined };

    let mock: any = def === a1 ? defaultMock : a1;
    let config: any = a2 ? a2 : a1 !== defaultMock ? a1 : undefined;
    if (isNgDef(def, 'p') && typeof a1 === 'function') {
      mock = a1;
      config = a2;
    } else if (isNgDef(def, 'i') || !isNgDef(def)) {
      config = a2;
    }
    mock = mock === config ? defaultMock : mock;

    const existing = this.mockDef.has(def) ? this.defProviders.get(def) : [];
    this.wipe(def);
    this.mockDef.add(def);

    // a magic to support modules with providers.
    if (providers) {
      this.defProviders.set(def, [...(existing || /* istanbul ignore next */ []), ...providers]);
    }

    if (mock !== defaultMock) {
      this.defValue.set(def, mock);
    } else {
      this.defValue.delete(def);
    }

    if (config) {
      this.configDef.set(def, config);
    } else {
      this.configDef.delete(def);
    }

    return this;
  }

  public provide(def: Provider): this {
    for (const provider of flatten(def)) {
      const provide = typeof provider === 'object' && provider.provide ? provider.provide : provider;
      const multi = typeof provider === 'object' && provider.provide && provider.multi;
      const existing = this.providerDef.has(provide) ? this.providerDef.get(provide) : [];
      this.wipe(provide);
      this.providerDef.set(
        provide,
        multi ? [...(Array.isArray(existing) ? existing : /* istanbul ignore next */ []), provider] : provider,
      );
    }

    return this;
  }

  public replace(source: Type<any>, destination: Type<any>, config?: IMockBuilderConfig): this {
    if (!isNgDef(destination) || !isNgDef(source) || isNgDef(destination, 'i') || isNgDef(source, 'i')) {
      throw new Error(
        'Cannot replace the declaration, both have to be a Module, a Component, a Directive or a Pipe, for Providers use `.mock` or `.provide`',
      );
    }

    this.wipe(source);
    this.replaceDef.add(source);
    this.defValue.set(source, destination);

    if (config) {
      this.configDef.set(source, config);
    } else {
      this.configDef.delete(source);
    }

    return this;
  }

  public async then<TResult1 = IMockBuilderResult>(
    fulfill?: ((value: IMockBuilderResult) => PromiseLike<TResult1>) | undefined | null,
    reject?: ((reason: any) => PromiseLike<any>) | undefined | null,
  ): Promise<TResult1> {
    const promise = new Promise((resolve: (value: IMockBuilderResult) => void): void => {
      const testBed = TestBed.configureTestingModule(this.build());
      for (const callback of mapValues(this.beforeCC)) {
        callback(testBed);
      }
      const testBedPromise = testBed.compileComponents();
      testBedPromise.then(() => {
        resolve({ testBed });
      });
    });

    return promise.then(fulfill, reject);
  }

  private combineParams(): BuilderData {
    return {
      configDef: this.configDef,
      defProviders: this.defProviders,
      defValue: this.defValue,
      excludeDef: this.excludeDef,
      keepDef: this.keepDef,
      mockDef: this.mockDef,
      providerDef: this.providerDef,
      replaceDef: this.replaceDef,
    };
  }

  private wipe(def: Type<any>): void {
    this.defProviders.delete(def);
    this.defValue.delete(def);
    this.excludeDef.delete(def);
    this.keepDef.delete(def);
    this.mockDef.delete(def);
    this.providerDef.delete(def);
    this.replaceDef.delete(def);
  }
}
