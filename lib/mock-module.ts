import { NgModule, Type, Component, Pipe, Directive } from '@angular/core';
import { MockComponent } from 'mock-component';
import { MockDirective } from 'mock-directive';
import { MockPipe } from 'mock-pipe';

type Declaration = Type<Component | Directive | Pipe>;
type moduleOptions = { declarations: Declaration[];
                       exports: Declaration[];
                       providers: Array<{ provide: any; useValue: {} }>; };

const mockLookup: { [key: string]: Function } = {
  Component: MockComponent,
  Directive: MockDirective,
  Pipe: MockPipe
};

const mockDeclaration = (declaration: Declaration) => {
  const type = (declaration as any).__annotations__[0].__proto__.ngMetadataName;
  return mockLookup[type](declaration);
};

const mockProvider = (provider: any) => ({
  provide: provider, useValue: {}
});

export function MockModule(module: Type<NgModule>): Type<NgModule> {
  return NgModule(MockIt(module))(class MockedModule {});
}

function MockIt(module: Type<NgModule>): moduleOptions {
  const mockedModule: moduleOptions = { declarations: [],
                                        exports: [],
                                        providers: [] };
  const declarations = (module as any).__annotations__[0].declarations || [];
  const imports = (module as any).__annotations__[0].imports || [];
  const providers = (module as any).__annotations__[0].providers || [];

  mockedModule.exports = mockedModule.declarations = [...declarations.map(mockDeclaration)];
  mockedModule.providers = providers.map(mockProvider);

  imports.reduce((acc: moduleOptions, imPort: Type<NgModule>) => {
    const result = MockIt(imPort);
    acc.declarations.push(...result.declarations);
    acc.providers.push(...result.providers);
    acc.exports.push(...result.declarations);
  }, mockedModule);

  return mockedModule;
}
