// tslint:disable:unified-signatures

import { InjectionToken, ModuleWithProviders, NgModule, PipeTransform, Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { flatten, isNgDef, isNgInjectionToken, NG_MOCKS } from '../common';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { MockComponent } from '../mock-component';
import { MockDirective } from '../mock-directive';
import { MockModule, MockProvider } from '../mock-module';
import { MockPipe } from '../mock-pipe';

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

const defaultMock = Symbol();

export class MockBuilderPromise implements PromiseLike<IMockBuilderResult> {
  protected beforeCC: Set<(testBed: typeof TestBed) => void> = new Set();
  protected configDef: Map<Type<any> | InjectionToken<any>, any> = new Map();

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
    // tslint:disable-line:cyclomatic-complexity
    const backup = {
      builder: ngMocksUniverse.builder,
      cache: ngMocksUniverse.cache,
      config: ngMocksUniverse.config,
      flags: ngMocksUniverse.flags,
      touches: ngMocksUniverse.touches,
    };

    ngMocksUniverse.builder = new Map();
    ngMocksUniverse.cache = new Map();
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
      ...this.keepDef.provider.values(),
      ...this.keepDef.pipe.values(),
      ...this.keepDef.directive.values(),
      ...this.keepDef.component.values(),
      ...this.keepDef.module.values(),
    ]) {
      ngMocksUniverse.builder.set(def, def);
    }

    for (const [source, destination] of [
      ...this.replaceDef.pipe.entries(),
      ...this.replaceDef.directive.entries(),
      ...this.replaceDef.component.entries(),
      ...this.replaceDef.module.entries(),
    ]) {
      ngMocksUniverse.builder.set(source, destination);
    }

    // mocking requested things.
    for (const def of this.mockDef.provider.values()) {
      if (this.mockDef.providerMock.has(def)) {
        ngMocksUniverse.builder.set(def, { provide: def, useValue: this.mockDef.providerMock.get(def) });
      } else {
        ngMocksUniverse.builder.set(def, MockProvider(def));
      }
      ngMocksUniverse.touches.delete(def);
    }
    for (const def of this.mockDef.pipe.values()) {
      if (this.mockDef.pipeTransform.has(def)) {
        ngMocksUniverse.builder.set(def, MockPipe(def, this.mockDef.pipeTransform.get(def)));
      } else {
        ngMocksUniverse.builder.set(def, MockPipe(def));
      }
      ngMocksUniverse.touches.delete(def);
    }
    for (const def of this.mockDef.directive.values()) {
      ngMocksUniverse.builder.set(def, MockDirective(def));
      ngMocksUniverse.touches.delete(def);
    }
    for (const def of this.mockDef.component.values()) {
      ngMocksUniverse.builder.set(def, MockComponent(def));
      ngMocksUniverse.touches.delete(def);
    }

    // Now we need to run through requested modules.
    for (const def of [
      ...this.mockDef.module.values(),
      ...this.keepDef.module.values(),
      ...this.replaceDef.module.keys(),
    ]) {
      ngMocksUniverse.builder.set(def, MockModule(def));
      ngMocksUniverse.touches.delete(def);
    }

    // Setting up TestBed.
    const imports: Array<Type<any> | ModuleWithProviders> = [];

    // Adding suitable leftovers.
    for (const def of [
      ...this.mockDef.module.values(),
      ...this.keepDef.module.values(),
      ...this.replaceDef.module.keys(),
    ]) {
      if (ngMocksUniverse.touches.has(def)) {
        continue;
      }
      const config = this.configDef.get(def);
      if (config && config.dependency) {
        continue;
      }
      imports.push(ngMocksUniverse.builder.get(def));
    }

    const declarations: Array<Type<any>> = [];

    // adding missed declarations to test bed.
    for (const def of [
      ...this.keepDef.pipe.values(),
      ...this.keepDef.directive.values(),
      ...this.keepDef.component.values(),
      ...this.replaceDef.pipe.keys(),
      ...this.replaceDef.directive.keys(),
      ...this.replaceDef.component.keys(),
      ...this.mockDef.pipe.values(),
      ...this.mockDef.directive.values(),
      ...this.mockDef.component.values(),
    ]) {
      if (ngMocksUniverse.touches.has(def)) {
        continue;
      }
      const config = this.configDef.get(def);
      if (config && config.dependency) {
        continue;
      }
      declarations.push(ngMocksUniverse.builder.get(def));
    }

    const providers: Provider[] = [];

    // Adding missed providers to test bed.
    for (const def of this.keepDef.provider.values()) {
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
    }

    // Adding missed providers to test bed.
    for (const def of this.mockDef.provider.values()) {
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
    }

    // Adding requested providers to test bed.
    for (const provider of this.providerDef.values()) {
      if (!provider) {
        continue;
      }
      providers.push(provider);
    }

    const ngMocks = new Map();
    for (const [key, value] of [...ngMocksUniverse.builder.entries(), ...ngMocksUniverse.cache.entries()]) {
      ngMocks.set(key, value);
    }

    providers.push({
      provide: NG_MOCKS,
      useValue: ngMocks,
    });

    Object.assign(ngMocksUniverse, backup);

    return {
      declarations,
      imports,
      providers,
    };
  }

  public keep(def: any, config?: IMockBuilderConfig): this {
    if (isNgDef(def, 'm')) {
      this.mockDef.module.delete(def);
      this.replaceDef.module.delete(def);
      this.keepDef.module.add(def);
    } else if (isNgDef(def, 'c')) {
      this.mockDef.component.delete(def);
      this.replaceDef.component.delete(def);
      this.keepDef.component.add(def);
    } else if (isNgDef(def, 'd')) {
      this.mockDef.directive.delete(def);
      this.replaceDef.directive.delete(def);
      this.keepDef.directive.add(def);
    } else if (isNgDef(def, 'p')) {
      this.mockDef.pipe.delete(def);
      this.mockDef.pipeTransform.delete(def);
      this.replaceDef.pipe.delete(def);
      this.keepDef.pipe.add(def);
    } else {
      this.mockDef.provider.delete(def);
      this.mockDef.providerMock.delete(def);
      this.providerDef.delete(def);
      this.keepDef.provider.add(def);
    }
    if (config) {
      this.configDef.set(def, config);
    } else {
      this.configDef.delete(def);
    }
    return this;
  }

  public mock(pipe: Type<PipeTransform>, config?: IMockBuilderConfig): this;
  public mock(pipe: Type<PipeTransform>, mock?: PipeTransform['transform'], config?: IMockBuilderConfig): this;
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
      this.mockDef.module.add(def);
    } else if (isNgDef(def, 'c')) {
      this.keepDef.component.delete(def);
      this.replaceDef.component.delete(def);
      this.mockDef.component.add(def);
    } else if (isNgDef(def, 'd')) {
      this.keepDef.directive.delete(def);
      this.replaceDef.directive.delete(def);
      this.mockDef.directive.add(def);
    } else if (isNgDef(def, 'p')) {
      this.keepDef.pipe.delete(def);
      this.replaceDef.pipe.delete(def);
      this.mockDef.pipe.add(def);
      if (typeof mock === 'function') {
        this.mockDef.pipeTransform.set(def, mock);
      }
    } else {
      this.keepDef.provider.delete(def);
      this.providerDef.delete(def);
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
      this.replaceDef.module.set(source, destination);
    } else if (isNgDef(source, 'c') && isNgDef(destination, 'c')) {
      this.keepDef.component.delete(source);
      this.mockDef.component.delete(source);
      this.replaceDef.component.set(source, destination);
    } else if (isNgDef(source, 'd') && isNgDef(destination, 'd')) {
      this.keepDef.directive.delete(source);
      this.mockDef.directive.delete(source);
      this.replaceDef.directive.set(source, destination);
    } else if (isNgDef(source, 'p') && isNgDef(destination, 'p')) {
      this.keepDef.pipe.delete(source);
      this.mockDef.pipe.delete(source);
      this.replaceDef.pipe.set(source, destination);
    } else {
      throw new Error('cannot replace the source by destination destination, wrong types');
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
      for (const callback of this.beforeCC.values()) {
        callback(testBed);
      }
      testBed.compileComponents().then(() => {
        resolve({ testBed });
      });
    });
    return promise.then(fulfill, reject);
  }
}

export function MockBuilder(componentToTest?: Type<any>, itsModuleToMock?: Type<any>): MockBuilderPromise {
  const instance = new MockBuilderPromise();

  if (componentToTest) {
    instance.keep(componentToTest, {
      export: true,
    });
  }
  if (itsModuleToMock) {
    instance.mock(itsModuleToMock);
  }
  return instance;
}
