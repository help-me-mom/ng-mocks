import { AnyType, Type } from '../common/core.types';
import { isNgDef } from '../common/func.is-ng-def';
import { MockComponent } from '../mock-component/mock-component';
import { MockedComponent } from '../mock-component/types';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockedDirective } from '../mock-directive/types';
import { MockPipe } from '../mock-pipe/mock-pipe';
import { MockedPipe } from '../mock-pipe/types';

export function MockDeclarations(...declarations: Array<Type<any>>): Array<Type<any>> {
  return declarations.map(MockDeclaration);
}

export function MockDeclaration<T>(
  declaration: AnyType<T>
): Type<MockedPipe<T> | MockedDirective<T> | MockedComponent<T>>;
export function MockDeclaration<T>(
  declaration: AnyType<T>
): Type<MockedPipe<T> | MockedDirective<T> | MockedComponent<T>>;
export function MockDeclaration<T>(
  declaration: Type<T>
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
