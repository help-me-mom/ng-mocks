import { CommonModule } from '@angular/common';
import { NgModule, Type } from '@angular/core';
import { ngModuleResolver } from '../common/reflect';
import { MockDeclaration } from '../mock-declaration';

interface IModuleOptions {
  declarations: Array<Type<any>>;
  exports: Array<Type<any>>;
  imports: Array<Type<any>>;
  providers: Array<{ provide: any; useValue: {} }>;
}

const mockProvider = (provider: any) => ({
  provide: provider, useValue: {}
});

export function MockModule(module: Type<NgModule>): Type<NgModule> {
  return NgModule(MockIt(module))(class MockedModule {});
}

const NEVER_MOCK: Array<Type<NgModule>> = [CommonModule];

function MockIt(module: Type<NgModule>): IModuleOptions {
  if (NEVER_MOCK.includes(module)) {
    return module as any;
  }
  const mockedModule: IModuleOptions = { declarations: [],
                                         exports: [],
                                         imports: [],
                                         providers: [] };
  const { declarations = [], imports = [], providers = [] } = ngModuleResolver.resolve(module);

  mockedModule.exports = mockedModule.declarations = [...declarations.map(MockDeclaration)];
  mockedModule.providers = providers.map(mockProvider);
  mockedModule.imports = [];

  imports.forEach((imPort: Type<NgModule>) => {
    const result = MockIt(imPort);
    if ((result as any) === imPort) {
      mockedModule.imports.push(imPort);
    } else {
      mockedModule.declarations.push(...result.declarations);
      mockedModule.providers.push(...result.providers);
      mockedModule.exports.push(...result.declarations);
    }
  });

  return mockedModule;
}
