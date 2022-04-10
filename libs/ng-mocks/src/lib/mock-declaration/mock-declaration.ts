import { Type } from '../common/core.types';
import errorJestMock from '../common/error.jest-mock';
import funcGetName from '../common/func.get-name';
import { isNgDef } from '../common/func.is-ng-def';
import { MockComponent } from '../mock-component/mock-component';
import { MockedComponent } from '../mock-component/types';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockedDirective } from '../mock-directive/types';
import { MockPipe } from '../mock-pipe/mock-pipe';
import { MockedPipe } from '../mock-pipe/types';

/**
 * MockDeclarations creates an array of mock declaration classes out of declarations passed as parameters.
 *
 * @see https://ng-mocks.sudo.eu/api/MockComponent
 * @see https://ng-mocks.sudo.eu/api/MockDirective
 * @see https://ng-mocks.sudo.eu/api/MockPipe
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   declarations: MockDeclarations(
 *     Dep1Component,
 *     Dep2Directive,
 *     Dep3Pipe,
 *   ),
 * });
 * ```
 */
export function MockDeclarations(...declarations: Array<Type<any>>): Array<Type<any>> {
  return declarations.map(MockDeclaration);
}

/**
 * MockDeclaration creates a mock declaration class out of an arbitrary declaration.
 *
 * @see https://ng-mocks.sudo.eu/api/MockComponent
 * @see https://ng-mocks.sudo.eu/api/MockDirective
 * @see https://ng-mocks.sudo.eu/api/MockPipe
 *
 * ```ts
 * TestBed.configureTestingModule({
 *   declarations: [
 *     MockDeclaration(Dep1Component),
 *     MockDeclaration(Dep2Directive),
 *     MockDeclaration(Dep3Pipe),
 *   ],
 * });
 * ```
 */
export function MockDeclaration<T>(declaration: Type<T>): Type<MockedPipe<T> | MockedDirective<T> | MockedComponent<T>>;

export function MockDeclaration<T>(
  declaration: Type<T>,
): Type<MockedPipe<T> | MockedDirective<T> | MockedComponent<T>> {
  if (isNgDef(declaration, 'p')) {
    return MockPipe(declaration);
  }
  if (isNgDef(declaration, 'c')) {
    return MockComponent(declaration);
  }
  if (isNgDef(declaration, 'd')) {
    return MockDirective(declaration);
  }

  errorJestMock(declaration);
  throw new Error(
    [
      'MockDeclaration does not know how to mock',
      typeof declaration === 'function' ? funcGetName(declaration) : declaration,
    ].join(' '),
  );
}
