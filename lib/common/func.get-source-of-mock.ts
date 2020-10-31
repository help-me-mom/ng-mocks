import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { Type } from './core.types';

/**
 * Returns an original type.
 *
 * @see https://github.com/ike18t/ng-mocks#getsourceofmock
 */
export function getSourceOfMock<T>(declaration: Type<MockedModule<T>>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://github.com/ike18t/ng-mocks#getsourceofmock
 */
export function getSourceOfMock<T>(declaration: Type<MockedComponent<T>>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://github.com/ike18t/ng-mocks#getsourceofmock
 */
export function getSourceOfMock<T>(declaration: Type<MockedDirective<T>>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://github.com/ike18t/ng-mocks#getsourceofmock
 */
export function getSourceOfMock<T>(declaration: Type<MockedPipe<T>>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://github.com/ike18t/ng-mocks#getsourceofmock
 */
export function getSourceOfMock<T>(declaration: Type<T>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://github.com/ike18t/ng-mocks#getsourceofmock
 */
export function getSourceOfMock<T>(declaration: any): Type<T> {
  return typeof declaration === 'function' && declaration.mockOf ? declaration.mockOf : declaration;
}
