import { Declaration } from '../common';
import { MockComponent } from '../mock-component';
import { MockDirective } from '../mock-directive';
import { MockPipe } from '../mock-pipe';

/* tslint:disable-next-line:ban-types */
const mockLookup: { [key: string]: Function } = {
  Component: MockComponent,
  Directive: MockDirective,
  Pipe: MockPipe
};

export function MockDeclarations(...declarations: Declaration[]): Declaration[] {
  return declarations.map(MockDeclaration);
}

export function MockDeclaration(declaration: Declaration): Declaration {
  const type = (declaration as any).__annotations__[0].__proto__.ngMetadataName;
  return mockLookup[type](declaration);
}
