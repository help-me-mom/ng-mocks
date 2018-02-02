import { Type } from '@angular/core';
import { MockComponent } from 'mock-component';
import { MockDirective } from 'mock-directive';
import { MockPipe } from 'mock-pipe';

const mockLookup: { [key: string]: any } = {
  Component: MockComponent,
  Directive: MockDirective,
  Pipe: MockPipe
};

const mockDeclaration = (declaration: any) => {
  const type = declaration.__annotations__[0].__proto__.ngMetadataName;
  return mockLookup[type](declaration);
};

const mockProvider = (provider: any) => ({
  provide: provider, useValue: {}
});

export function MockModule<TModule>(module: Type<TModule>): Type<TModule> {
  const mockedModule = { declarations: [] as any[],
                         providers: [] as any[] };
  const declarations = (module as any).__annotations__[0].declarations || [];
  const imports = (module as any).__annotations__[0].imports || [];
  const providers = (module as any).__annotations__[0].providers || [];
  mockedModule.declarations = [...imports.map(MockModule),
                               ...declarations.map(mockDeclaration)];
  mockedModule.providers = providers.map(mockProvider);
  return (mockedModule as any) as Type<TModule>;
}
