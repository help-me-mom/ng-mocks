import { InjectionToken, NgModule, PipeTransform, Provider } from '@angular/core';
import { MetadataOverride, TestBed, TestModuleMetadata } from '@angular/core/testing';
import { directiveResolver, ngModuleResolver } from 'ng-mocks/dist/lib/common/reflect';
import { ngMocks } from 'ng-mocks/dist/lib/mock-helper';

import {
  AbstractType,
  flatten,
  isNgDef,
  isNgInjectionToken,
  mapEntries,
  mapKeys,
  mapValues,
  NgModuleWithProviders,
  NG_MOCKS,
  NG_MOCKS_OVERRIDES,
  NG_MOCKS_TOUCHES,
  Type,
} from '../common';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { MockComponent } from '../mock-component';
import { MockDirective } from '../mock-directive';
import { MockModule, MockNgDef, MockProvider } from '../mock-module';
import { MockPipe } from '../mock-pipe';
import { mockServiceHelper } from '../mock-service';

export interface IMockBuilderResult {
  testBed: typeof TestBed;
}

export interface IMockBuilderConfigAll {
  dependency?: boolean; // won't be added to TestBedModule.
  export?: boolean; // will be forced for export in its module.
}

export interface IMockBuilderConfigComponent {
  render?: {
    [blockName: string]:
      | boolean
      | {
          $implicit?: any;
          variables?: { [key: string]: any };
        };
  };
}

export interface IMockBuilderConfigDirective {
  render?:
    | boolean
    | {
        $implicit?: any;
        variables?: { [key: string]: any };
      };
}

export type IMockBuilderConfig = IMockBuilderConfigAll | IMockBuilderConfigComponent | IMockBuilderConfigDirective;

const defaultMock = {}; // simulating Symbol

export class MockBuilderPromise implements PromiseLike<IMockBuilderResult> {
  protected beforeCC: Set<(testBed: typeof TestBed) => void> = new Set();
  protected configDef: Map<Type<any> | InjectionToken<any>, any> = new Map();

  protected excludeDef: Set<Type<any> | InjectionToken<any>> = new Set();

  protected keepDef: {
    component: Set<Type<any>>;
    directive: Set<Type<any>>;
    module: Set<Type<any>>;
    pipe: Set<Type<any & PipeTransform>>;
    provider: Set<Type<any> | InjectionToken<any>>;
  } = {
    component: new Set(),
    directive: new Set(),
    module: new Set(),
    pipe: new Set(),
    provider: new Set(),
  };

  protected mockDef: {
    component: Set<Type<any>>;
    directive: Set<Type<any>>;
    module: Set<Type<any>>;
    pipe: Set<Type<any & PipeTransform>>;
    pipeTransform: Map<Type<any & PipeTransform>, PipeTransform['transform']>;
    provider: Set<Type<any> | InjectionToken<any>>;
    providerMock: Map<Type<any> | InjectionToken<any>, any>;
  } = {
    component: new Set(),
    directive: new Set(),
    module: new Set(),
    pipe: new Set(),
    pipeTransform: new Map(),
    provider: new Set(),
    providerMock: new Map(),
  };

  protected providerDef: Map<Type<any> | InjectionToken<any>, Provider> = new Map();

  protected replaceDef: {
    component: Map<Type<any>, Type<any>>;
    directive: Map<Type<any>, Type<any>>;
    module: Map<Type<any>, Type<any>>;
    pipe: Map<Type<any & PipeTransform>, Type<any & PipeTransform>>;
  } = {
    component: new Map(),
    directive: new Map(),
    module: new Map(),
    pipe: new Map(),
  };

  public beforeCompileComponents(callback: (testBed: typeof TestBed) => void): this {
    this.beforeCC.add(callback);
    return this;
  }

  public build(): NgModule {
    const backup = {
      builder: ngMocksUniverse.builder,
      cacheMocks: ngMocksUniverse.cacheMocks,
      cacheProviders: ngMocksUniverse.cacheProviders,
      config: ngMocksUniverse.config,
      flags: ngMocksUniverse.flags,
      touches: ngMocksUniverse.touches,
    };

    ngMocksUniverse.builder = new Map();
    ngMocksUniverse.cacheMocks = new Map();
    ngMocksUniverse.cacheProviders = new Map();
    ngMocksUniverse.config = this.configDef;
    ngMocksUniverse.flags = new Set([
      'cacheComponent',
      'cacheDirective',
      'cacheModule',
      'cachePipe',
      'cacheProvider',
      'correctModuleExports',
    ]);
    ngMocksUniverse.touches = new Set();

    for (const def of [
      ...mapValues(this.keepDef.provider),
      ...mapValues(this.keepDef.pipe),
      ...mapValues(this.keepDef.directive),
      ...mapValues(this.keepDef.component),
      ...mapValues(this.keepDef.module),
    ]) {
      ngMocksUniverse.builder.set(def, def);
    }

    for (const [source, destination] of [
      ...mapEntries(this.replaceDef.pipe),
      ...mapEntries(this.replaceDef.directive),
      ...mapEntries(this.replaceDef.component),
      ...mapEntries(this.replaceDef.module),
    ]) {
      ngMocksUniverse.builder.set(source, destination);
    }

    for (const def of [...mapValues(this.excludeDef)]) {
      ngMocksUniverse.builder.set(def, null);
    }

    // mocking requested things.
    for (const def of mapValues(this.mockDef.provider)) {
      if (this.mockDef.providerMock.has(def)) {
        const instance = this.mockDef.providerMock.get(def);
        ngMocksUniverse.builder.set(
          def,
          mockServiceHelper.useFactory(def, () => instance)
        );
      } else {
        ngMocksUniverse.builder.set(def, MockProvider(def));
      }
      ngMocksUniverse.touches.delete(def);
    }
    for (const def of mapValues(this.mockDef.pipe)) {
      if (this.mockDef.pipeTransform.has(def)) {
        ngMocksUniverse.builder.set(def, MockPipe(def, this.mockDef.pipeTransform.get(def)));
      } else {
        ngMocksUniverse.builder.set(def, MockPipe(def));
      }
      ngMocksUniverse.touches.delete(def);
    }
    for (const def of mapValues(this.mockDef.directive)) {
      ngMocksUniverse.builder.set(def, MockDirective(def));
      ngMocksUniverse.touches.delete(def);
    }
    for (const def of mapValues(this.mockDef.component)) {
      ngMocksUniverse.builder.set(def, MockComponent(def));
      ngMocksUniverse.touches.delete(def);
    }

    // Now we need to run through requested modules.
    for (const def of [
      ...mapValues(this.mockDef.module),
      ...mapValues(this.keepDef.module),
      ...mapKeys(this.replaceDef.module),
    ]) {
      ngMocksUniverse.builder.set(def, MockModule(def));
      ngMocksUniverse.touches.delete(def);
    }

    // Setting up TestBed.
    const imports: Array<Type<any> | NgModuleWithProviders> = [];

    // Adding suitable leftovers.
    for (const def of [
      ...mapValues(this.mockDef.module),
      ...mapValues(this.keepDef.module),
      ...mapKeys(this.replaceDef.module),
    ]) {
      if (ngMocksUniverse.touches.has(def)) {
        continue;
      }
      const config = this.configDef.get(def);
      if (config && config.dependency) {
        continue;
      }
      imports.push(ngMocksUniverse.builder.get(def));
      ngMocksUniverse.touches.add(def);
    }

    const declarations: Array<Type<any>> = [];

    // adding missed declarations to test bed.
    for (const def of [
      ...mapValues(this.keepDef.pipe),
      ...mapValues(this.keepDef.directive),
      ...mapValues(this.keepDef.component),
      ...mapKeys(this.replaceDef.pipe),
      ...mapKeys(this.replaceDef.directive),
      ...mapKeys(this.replaceDef.component),
      ...mapValues(this.mockDef.pipe),
      ...mapValues(this.mockDef.directive),
      ...mapValues(this.mockDef.component),
    ]) {
      if (ngMocksUniverse.touches.has(def)) {
        continue;
      }
      const config = this.configDef.get(def);
      if (config && config.dependency) {
        continue;
      }
      declarations.push(ngMocksUniverse.builder.get(def));
      ngMocksUniverse.touches.add(def);
    }

    const providers: Provider[] = [];

    // Adding missed providers to test bed.
    for (const def of mapValues(this.keepDef.provider)) {
      if (ngMocksUniverse.touches.has(def)) {
        continue;
      }
      const config = this.configDef.get(def);
      if (config && config.dependency) {
        continue;
      }
      if (isNgInjectionToken(def)) {
        continue;
      }
      providers.push(def);
      ngMocksUniverse.touches.add(def);
    }

    // Adding missed providers to test bed.
    for (const def of mapValues(this.mockDef.provider)) {
      if (ngMocksUniverse.touches.has(def)) {
        continue;
      }
      const config = this.configDef.get(def);
      if (config && config.dependency) {
        continue;
      }
      const mock = ngMocksUniverse.builder.get(def);
      providers.push(
        mock
          ? mock
          : {
              provide: def,
              useValue: undefined,
            }
      );
      ngMocksUniverse.touches.add(def);
    }

    // Adding requested providers to test bed.
    for (const provider of mapValues(this.providerDef)) {
      if (!provider) {
        continue;
      }
      providers.push(provider);
    }

    const mocks = new Map();
    for (const [key, value] of [
      ...mapEntries(ngMocksUniverse.builder),
      ...mapEntries(ngMocksUniverse.cacheMocks),
      ...mapEntries(ngMocksUniverse.cacheProviders),
    ]) {
      if (mocks.has(key)) {
        continue;
      }
      mocks.set(key, value);
    }

    providers.push({
      provide: NG_MOCKS,
      useValue: mocks,
    });

    // Redefining providers for kept declarations.
    const touches = new Set();
    providers.push({
      provide: NG_MOCKS_TOUCHES,
      useValue: touches,
    });
    const overrides: Map<Type<any>, MetadataOverride<any>> = new Map();
    providers.push({
      provide: NG_MOCKS_OVERRIDES,
      useValue: overrides,
    });
    for (const proto of mapValues(ngMocksUniverse.touches)) {
      const source: any = proto;
      let value = ngMocksUniverse.builder.get(source);

      // kept declarations should be based on their source.
      if (value === undefined) {
        value = source;
      }

      touches.add(source);
      touches.add(value);

      // no customizations in replacements
      if (this.replaceDef.module.has(source) && value === this.replaceDef.module.get(source)) {
        continue;
      }
      if (this.replaceDef.component.has(source) && value === this.replaceDef.component.get(source)) {
        continue;
      }
      if (this.replaceDef.directive.has(source) && value === this.replaceDef.directive.get(source)) {
        continue;
      }
      if (this.replaceDef.pipe.has(source) && value === this.replaceDef.pipe.get(source)) {
        continue;
      }

      let meta: NgModule | undefined;
      if (isNgDef(value, 'm')) {
        meta = ngModuleResolver.resolve(value);
      } else if (isNgDef(value, 'c')) {
        meta = directiveResolver.resolve(value);
      } else if (isNgDef(value, 'd')) {
        meta = directiveResolver.resolve(value);
      } else {
        continue;
      }

      const skipMock = ngMocksUniverse.flags.has('skipMock');
      if (!skipMock) {
        ngMocksUniverse.flags.add('skipMock');
      }
      const [changed, def] = MockNgDef(meta);
      if (!skipMock) {
        ngMocksUniverse.flags.delete('skipMock');
      }
      if (!changed) {
        continue;
      }
      const override: MetadataOverride<NgModule> = {
        set: def,
      };
      overrides.set(value, override);
      if (!ngMocksUniverse.resetOverrides.has(value)) {
        ngMocksUniverse.resetOverrides.add(value);
      }
    }

    for (const key of Object.keys(backup)) {
      (ngMocksUniverse as any)[key] = (backup as any)[key];
    }

    return {
      declarations,
      imports,
      providers,
    };
  }

  public exclude(def: any): this {
    this.keepDef.component.delete(def);
    this.keepDef.directive.delete(def);
    this.keepDef.module.delete(def);
    this.keepDef.pipe.delete(def);
    this.keepDef.provider.delete(def);

    this.mockDef.component.delete(def);
    this.mockDef.directive.delete(def);
    this.mockDef.module.delete(def);
    this.mockDef.pipe.delete(def);
    this.mockDef.pipeTransform.delete(def);
    this.mockDef.provider.delete(def);
    this.mockDef.providerMock.delete(def);

    this.providerDef.delete(def);

    this.replaceDef.component.delete(def);
    this.replaceDef.directive.delete(def);
    this.replaceDef.module.delete(def);
    this.replaceDef.pipe.delete(def);

    this.excludeDef.add(def);

    return this;
  }

  public keep(def: any, config?: IMockBuilderConfig): this {
    if (isNgDef(def, 'm')) {
      this.mockDef.module.delete(def);
      this.replaceDef.module.delete(def);
      this.excludeDef.delete(def);
      this.keepDef.module.add(def);
    } else if (isNgDef(def, 'c')) {
      this.mockDef.component.delete(def);
      this.replaceDef.component.delete(def);
      this.excludeDef.delete(def);
      this.keepDef.component.add(def);
    } else if (isNgDef(def, 'd')) {
      this.mockDef.directive.delete(def);
      this.replaceDef.directive.delete(def);
      this.excludeDef.delete(def);
      this.keepDef.directive.add(def);
    } else if (isNgDef(def, 'p')) {
      this.mockDef.pipe.delete(def);
      this.mockDef.pipeTransform.delete(def);
      this.replaceDef.pipe.delete(def);
      this.excludeDef.delete(def);
      this.keepDef.pipe.add(def);
    } else {
      this.mockDef.provider.delete(def);
      this.mockDef.providerMock.delete(def);
      this.providerDef.delete(def);
      this.excludeDef.delete(def);
      this.keepDef.provider.add(def);
    }
    if (config) {
      this.configDef.set(def, config);
    } else {
      this.configDef.delete(def);
    }
    return this;
  }

  public mock<T extends PipeTransform>(pipe: Type<T>, config?: IMockBuilderConfig): this;
  public mock<T extends PipeTransform>(
    pipe: Type<T>,
    mock?: PipeTransform['transform'],
    config?: IMockBuilderConfig
  ): this;
  public mock<T>(token: InjectionToken<T>, mock?: any): this;
  public mock<T>(def: Type<T>, mock: IMockBuilderConfig): this;
  public mock<T>(provider: Type<T>, mock?: any): this;
  public mock<T>(def: Type<T>): this;
  public mock(def: any, a1: any = defaultMock, a2?: any): this {
    let mock: any = a1;
    let config: any = a1 === defaultMock ? undefined : a1;
    if (isNgDef(def, 'p') && typeof a1 === 'function') {
      mock = a1;
      config = a2;
    }

    if (isNgDef(def, 'm')) {
      this.keepDef.module.delete(def);
      this.replaceDef.module.delete(def);
      this.excludeDef.delete(def);
      this.mockDef.module.add(def);
    } else if (isNgDef(def, 'c')) {
      this.keepDef.component.delete(def);
      this.replaceDef.component.delete(def);
      this.excludeDef.delete(def);
      this.mockDef.component.add(def);
    } else if (isNgDef(def, 'd')) {
      this.keepDef.directive.delete(def);
      this.replaceDef.directive.delete(def);
      this.excludeDef.delete(def);
      this.mockDef.directive.add(def);
    } else if (isNgDef(def, 'p')) {
      this.keepDef.pipe.delete(def);
      this.replaceDef.pipe.delete(def);
      this.excludeDef.delete(def);
      this.mockDef.pipe.add(def);
      if (typeof mock === 'function') {
        this.mockDef.pipeTransform.set(def, mock);
      }
    } else {
      this.keepDef.provider.delete(def);
      this.providerDef.delete(def);
      this.excludeDef.delete(def);
      this.mockDef.provider.add(def);
      if (mock !== defaultMock) {
        this.mockDef.providerMock.set(def, mock);
      }
      config = undefined;
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
      this.keepDef.provider.delete(provide);
      this.mockDef.provider.delete(provide);
      const existing = this.providerDef.has(provide) ? this.providerDef.get(provide) : [];
      this.providerDef.set(provide, multi ? [...(Array.isArray(existing) ? existing : []), provider] : provider);
    }
    return this;
  }

  public replace(source: Type<any>, destination: Type<any>, config?: IMockBuilderConfig): this {
    if (isNgDef(source, 'm') && isNgDef(destination, 'm')) {
      this.keepDef.module.delete(source);
      this.mockDef.module.delete(source);
      this.excludeDef.delete(source);
      this.replaceDef.module.set(source, destination);
    } else if (isNgDef(source, 'c') && isNgDef(destination, 'c')) {
      this.keepDef.component.delete(source);
      this.mockDef.component.delete(source);
      this.excludeDef.delete(source);
      this.replaceDef.component.set(source, destination);
    } else if (isNgDef(source, 'd') && isNgDef(destination, 'd')) {
      this.keepDef.directive.delete(source);
      this.mockDef.directive.delete(source);
      this.excludeDef.delete(source);
      this.replaceDef.directive.set(source, destination);
    } else if (isNgDef(source, 'p') && isNgDef(destination, 'p')) {
      this.keepDef.pipe.delete(source);
      this.mockDef.pipe.delete(source);
      this.excludeDef.delete(source);
      this.replaceDef.pipe.set(source, destination);
    } else {
      throw new Error(
        'Cannot replace the declaration, both have to be a Module, a Component, a Directive or a Pipe, for Providers use `.mock` or `.provide`'
      );
    }
    if (config) {
      this.configDef.set(source, config);
    } else {
      this.configDef.delete(source);
    }
    return this;
  }

  public then<TResult1 = IMockBuilderResult, TResult2 = never>(
    fulfill?: (value: IMockBuilderResult) => PromiseLike<TResult1>,
    reject?: (reason: any) => PromiseLike<TResult2>
  ): PromiseLike<TResult1 | TResult2> {
    const promise = new Promise((resolve: (value: IMockBuilderResult) => void): void => {
      const testBed = TestBed.configureTestingModule(this.build());
      for (const callback of mapValues(this.beforeCC)) {
        callback(testBed);
      }
      testBed.compileComponents().then(() => {
        resolve({ testBed });
      });
    });
    return promise.then(fulfill, reject);
  }
}

export function MockBuilder(keepDeclaration?: Type<any>, itsModuleToMock?: Type<any>): MockBuilderPromise {
  if (!(TestBed as any).ngMocks) {
    const configureTestingModule = TestBed.configureTestingModule;
    TestBed.configureTestingModule = (moduleDef: TestModuleMetadata) => {
      let mocks: Map<any, any> | undefined;
      let touches: Set<any> | undefined;
      let overrides: Map<Type<any> | AbstractType<any>, MetadataOverride<any>> | undefined;

      for (const provide of flatten(moduleDef.providers || [])) {
        if (typeof provide !== 'object') {
          continue;
        }
        if (provide.provide === NG_MOCKS) {
          mocks = provide.useValue;
        }
        if (provide.provide === NG_MOCKS_TOUCHES) {
          touches = provide.useValue;
        }
        if (provide.provide === NG_MOCKS_OVERRIDES) {
          overrides = provide.useValue;
        }
      }

      if (mocks) {
        ngMocks.flushTestBed();
      }
      const testBed = configureTestingModule.call(TestBed, moduleDef);
      if (!mocks) {
        return testBed;
      }
      if (!overrides) {
        overrides = new Map();
      }

      // Thanks Ivy and its TestBed.override - it doesn't clean up leftovers.
      for (const def of touches ? mapValues(touches) : []) {
        if (overrides.has(def)) {
          continue;
        }

        // checking if an override has been made in past
        if (!ngMocksUniverse.resetOverrides.has(def)) {
          continue;
        }
        ngMocksUniverse.resetOverrides.delete(def);

        if (isNgDef(def, 'm')) {
          overrides.set(def, {});
        } else if (isNgDef(def, 'c')) {
          overrides.set(def, {});
        } else if (isNgDef(def, 'd')) {
          overrides.set(def, {});
        } else if (isNgDef(def, 'p')) {
          overrides.set(def, {});
        }
      }

      // Now we can apply overrides.
      for (const [def, override] of overrides ? mapEntries(overrides) : []) {
        if (isNgDef(def, 'm')) {
          testBed.overrideModule(def, override);
        } else if (isNgDef(def, 'c')) {
          testBed.overrideComponent(def, override);
        } else if (isNgDef(def, 'd')) {
          testBed.overrideDirective(def, override);
        } else if (isNgDef(def, 'p')) {
          testBed.overridePipe(def, override);
        }
      }

      return testBed;
    };
    (TestBed as any).ngMocks = true;
  }

  const instance = new MockBuilderPromise();

  if (keepDeclaration) {
    instance.keep(keepDeclaration, {
      export: true,
    });
  }
  if (itsModuleToMock) {
    instance.mock(itsModuleToMock);
  }
  return instance;
}
