import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule, Provider, Type } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockOf } from '../common';
import { jitReflector, ngModuleResolver } from '../common/reflect';
import { MockDeclaration } from '../mock-declaration';

const cache = new Map<Type<NgModule>, Type<NgModule>>();

export type ImportInstance = Type<NgModule> | ModuleWithProviders;

// Interface of extra flags for MockModule function. Should be used internally.
export interface IMockModuleConfig {
  exposeDeclarations?: boolean;
}

interface IModuleOptions {
  declarations?: Array<Type<any>>;
  exports?: Array<Type<any>>;
  imports?: Array<Type<any> | ModuleWithProviders | any[]>;
  providers?: Provider[];
}

const mockProvider = (provider: any): Provider | undefined => {
  const provide = typeof provider === 'object' && provider.provide ? provider.provide : provider;
  const multi = typeof provider === 'object' && provider.multi;

  // RouterModule injects own Application Initializer, which doesn't allow mocks due to own logic.
  // We have to avoid any injection of Application Initializer to mock everything properly.
  if (
    typeof provide === 'object' && provide.ngMetadataName === 'InjectionToken'
    && provide.toString() === 'InjectionToken Application Initializer'
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

export function MockModule(module: ImportInstance, config: IMockModuleConfig = {}): ImportInstance {
  // Usually we want to test what we have inside of module we passed here explicitly.
  // For that we should have config.exposeDeclarations = true.
  // That means all imports and declarations of the module will be exported.
  // Other modules from list of imports of the module expose only own exports.
  // It allow us to see failures in case if we use something what wasn't properly exported in nested modules.
  if (typeof config.exposeDeclarations !== 'boolean') {
    config.exposeDeclarations = true;
  }
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
    @NgModule(MockIt(ngModule, config))
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

const NEVER_MOCK: Array<Type<NgModule>> = [CommonModule, BrowserModule, BrowserAnimationsModule];

function MockIt(module: Type<NgModule>, config: IMockModuleConfig): IModuleOptions {
  const mockedModule: IModuleOptions = {};
  const {declarations = [], imports = [], exports = [], providers = []} = ngModuleResolver.resolve(module);

  // all nested modules should export only own exports.
  const nextConfig = {
    ...config,
    exposeDeclarations: false
  };

  if (imports.length) {
    mockedModule.imports = flatten(imports).map((instance: Type<any>) => {
      if (isModule(instance)) {
        return MockModule(instance, nextConfig);
      }
      if (isModuleWithProviders(instance)) {
        return MockModule(instance, nextConfig) as ModuleWithProviders;
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
        return MockModule(instance, nextConfig) as Type<NgModule>;
      }
      if (isModuleWithProviders(instance)) {
        return MockModule(instance, nextConfig);
      }
      return MockDeclaration(instance);
    }) as Array<Type<any>>;
  }

  // exposing declarations of the module.
  if (config.exposeDeclarations && (mockedModule.declarations || mockedModule.imports)) {
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
