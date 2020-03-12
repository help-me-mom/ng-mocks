import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { Mock, MockDeclaration, MockOf, MockService } from 'ng-mocks';

import { jitReflector, ngModuleResolver } from '../common/reflect';

const cache = new Map<Type<any>, Type<any>>();

export type MockedModule<T> = T & Mock & {};

// Some modules inject own providers, which don't allow mocks due to conflicts with test env.
// We have to avoid any injection of those providers to mock everything properly.
const neverMockProvidedToken = [
  // RouterModule
  'InjectionToken Application Initializer',
  // BrowserModule
  'InjectionToken EventManagerPlugins',
  'InjectionToken HammerGestureConfig',
];
const neverMockProvidedFunction = [
  // BrowserModule
  'ApplicationInitStatus',
  'DomRendererFactory2',
  'DomSharedStylesHost',
  'EventManager',
  // BrowserAnimationsModule
  'RendererFactory2',
];

const mockProvider = (provider: any): Provider | undefined => {
  const provide = typeof provider === 'object' && provider.provide ? provider.provide : provider;
  const multi = typeof provider === 'object' && provider.multi;

  if (
    typeof provide === 'object' && provide.ngMetadataName === 'InjectionToken'
    && neverMockProvidedToken.includes(provide.toString())
  ) {
    return provider;
  }

  if (
    typeof provide === 'function'
    && neverMockProvidedFunction.includes(provide.name)
  ) {
    return provider;
  }

  return {
    multi,
    provide,
    useValue: MockService(provide),
  };
};

const flatten = <T>(values: T | T[], result: T[] = []): T[] => {
  if (Array.isArray(values)) {
    values.forEach((value: T | T[]) => flatten(value, result));
  } else {
    result.push(values);
  }
  return result;
};

// Checks if an object was decorated by NgModule.
const isModule = (object: any): object is Type<any> => {
  const annotations = jitReflector.annotations(object);
  const ngMetadataNames = annotations.map((annotation) => annotation.__proto__.ngMetadataName);
  return ngMetadataNames.indexOf('NgModule') !== -1;
};

// Checks if an object implements ModuleWithProviders.
const isModuleWithProviders = (object: any): object is ModuleWithProviders => typeof object.ngModule !== 'undefined'
    && isModule(object.ngModule);

export function MockModule<T>(module: Type<T>): Type<MockedModule<T>>;
export function MockModule(module: ModuleWithProviders): ModuleWithProviders;
export function MockModule(module: any): any {
  let ngModule: Type<any>;
  let ngModuleProviders: Provider[] | undefined;
  let moduleMockPointer: Type<any>;

  if (isModuleWithProviders(module)) {
    ngModule = module.ngModule;
    if (module.providers) {
      ngModuleProviders = module.providers;
    }
  } else {
    ngModule = module;
  }

  if (NEVER_MOCK.includes(ngModule)) {
    return module;
  }

  // Every module should be mocked only once to avoid errors like:
  // Failed: Type ...Component is part of the declarations of 2 modules: ...Module and ...Module...
  const cacheHit = cache.get(ngModule);
  if (cacheHit) {
    moduleMockPointer = cacheHit;
  } else {
    @NgModule(MockIt(ngModule))
    @MockOf(ngModule)
    class ModuleMock extends Mock {
    }

    moduleMockPointer = ModuleMock;
    cache.set(ngModule, moduleMockPointer);
  }

  if (ngModuleProviders) {
    return {
      ngModule: moduleMockPointer,
      providers: flatten(ngModuleProviders).map(mockProvider)
        .filter((provider) => !!provider) as Provider[],
    };
  }
  return moduleMockPointer;
}

const NEVER_MOCK: Array<Type<any>> = [CommonModule];

function MockIt(module: Type<any>): NgModule {
  const mockedModule: NgModule = {};
  const { declarations = [], entryComponents = [], imports = [], providers = [] } = ngModuleResolver.resolve(module);

  if (imports.length) {
    mockedModule.imports = flatten(imports).map((instance: Type<any>) => {
      if (isModule(instance)) {
        return MockModule(instance);
      }
      if (isModuleWithProviders(instance)) {
        return MockModule(instance);
      }
      return MockDeclaration(instance);
    });
  }

  if (declarations.length) {
    mockedModule.declarations = flatten(declarations).map(MockDeclaration);
  }

  if (entryComponents.length) {
    mockedModule.entryComponents = flatten(entryComponents).map(MockDeclaration);
  }

  if (providers.length) {
    mockedModule.providers = flatten(providers).map(mockProvider)
      .filter((provider) => !!provider) as Provider[];
  }

  // When we mock module only exported declarations are accessible inside of test.
  // Because of that we have to export everything what a module imports or declares.
  // Unfortunately in that case tests won't fail when some module has missed exports.
  if (mockedModule.declarations || mockedModule.imports) {
    mockedModule.exports = [];

    if (mockedModule.imports) {
      const onlyModules = mockedModule.imports.map((instance) => {
        if (isModule(instance)) {
          return instance;
        }
        if (isModuleWithProviders(instance)) {
          return instance.ngModule;
        }
        return undefined;
      }).filter((instance) => instance) as Array<Type<any>>;
      mockedModule.exports = [...mockedModule.exports, ...onlyModules];
    }

    if (mockedModule.declarations) {
      mockedModule.exports = [...mockedModule.exports, ...mockedModule.declarations];
    }
  }

  return mockedModule;
}
