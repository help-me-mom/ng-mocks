import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { AnyType, Type } from './core.types';

/**
 * Returns an original type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 */
export function getSourceOfMock<T>(declaration: AnyType<MockedModule<T>>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 */
export function getSourceOfMock<T>(declaration: AnyType<MockedComponent<T>>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 */
export function getSourceOfMock<T>(declaration: AnyType<MockedDirective<T>>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 */
export function getSourceOfMock<T>(declaration: AnyType<MockedPipe<T>>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 */
export function getSourceOfMock<T>(declaration: AnyType<T>): Type<T>;

/**
 * Returns an original type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 */
export function getSourceOfMock<T>(declaration: any): Type<T> {
  return typeof declaration === 'function' && declaration.mockOf ? declaration.mockOf : declaration;
}
