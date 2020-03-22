import { Type } from '@angular/core';
import { MockComponent, MockedComponent } from '../mock-component';
import { MockDirective, MockedDirective } from '../mock-directive';
import { MockedPipe, MockPipe } from '../mock-pipe';

import { isNgDef } from '../common';

export function MockDeclarations(...declarations: Array<Type<any>>): Array<Type<any>> {
  return declarations.map(MockDeclaration);
}

export function MockDeclaration<T>(
  declaration: Type<T>,
): Type<MockedPipe<T> | MockedDirective<T> | MockedComponent<T>> {
  if (isNgDef(declaration, 'p')) {
    // TODO remove any when support of A5 has been stopped.
    return MockPipe(declaration) as any;
  }
  if (isNgDef(declaration, 'c')) {
    return MockComponent(declaration);
  }
  if (isNgDef(declaration, 'd')) {
    return MockDirective(declaration);
  }
  return declaration;
}
