import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { MockOf } from '../common';
import { jitReflector, ngModuleResolver } from '../common/reflect';
import { MockDeclaration } from '../mock-declaration';

const cache = new Map<Type<NgModule>, Type<NgModule>>();

export type ImportInstance = Type<NgModule> | ModuleWithProviders;

interface IModuleOptions {
  declarations?: Array<Type<any>>;
  exports?: Array<Type<any>>;
  imports?: Array<Type<any> | ModuleWithProviders | any[]>;
  providers?: Provider[];
}

// Some modules inject own providers, which don't allow mocks due to conflicts with test env.
// We have to avoid any injection of those providers to mock everything properly.
const neverMockProvidedToken = [
  // RouterModule
  'InjectionToken Application Initializer',
];
const neverMockProvidedFunction = [
  // BrowserModule
  'ApplicationInitStatus',
  'DomRendererFactory2',
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
    return undefined;
  }

  if (
    typeof provide === 'function'
    && neverMockProvidedFunction.includes(provide.name)
  ) {
    return undefined;
  }

  return {
    multi,
    provide,
    useValue: {},
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
const isModule = (object: any): object is Type<NgModule> => {
  const annotations = jitReflector.annotations(object);
  const ngMetadataNames = annotations.map((annotation) => annotation.__proto__.ngMetadataName);
  return ngMetadataNames.indexOf('NgModule') !== -1;
};

// Checks if an object implements ModuleWithProviders.
const isModuleWithProviders = (object: any): object is ModuleWithProviders => typeof object.ngModule !== 'undefined'
    && isModule(object.ngModule);

export function MockModule(module: ImportInstance): ImportInstance {
  let ngModule: Type<NgModule>;
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
    class ModuleMock {
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

const NEVER_MOCK: Array<Type<NgModule>> = [CommonModule];

function MockIt(module: Type<NgModule>): IModuleOptions {
  const mockedModule: IModuleOptions = {};
  const {declarations = [], imports = [], exports = [], providers = []} = ngModuleResolver.resolve(module);

  if (imports.length) {
    mockedModule.imports = flatten(imports).map((instance: Type<any>) => {
      if (isModule(instance)) {
        return MockModule(instance);
      }
      if (isModuleWithProviders(instance)) {
        return MockModule(instance) as ModuleWithProviders;
      }
      return MockDeclaration(instance);
    });
  }

  if (declarations.length) {
    mockedModule.declarations = flatten(declarations).map(MockDeclaration);
  }

  if (providers.length) {
    mockedModule.providers = flatten(providers).map(mockProvider)
      .filter((provider) => !!provider) as Provider[];
  }

  if (exports.length) {
    mockedModule.exports = flatten(exports).map((instance: Type<any>) => {
      if (isModule(instance)) {
        return MockModule(instance) as Type<NgModule>;
      }
      if (isModuleWithProviders(instance)) {
        return MockModule(instance);
      }
      return MockDeclaration(instance);
    }) as Array<Type<any>>;
  }

  // When we mock module only exported declarations are accessible inside of test.
  // Because of that we have to export everything what a module imports or declares.
  // Unfortunately in that case tests won't fail when some module has missed exports.
  if (mockedModule.declarations || mockedModule.imports) {
    mockedModule.exports = mockedModule.exports || [];

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
