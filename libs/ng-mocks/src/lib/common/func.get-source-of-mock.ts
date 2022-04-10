import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { AnyType, Type } from './core.types';

/**
 * Returns the original class of a mock module class.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 *
 * ```ts
 * getSourceOfMock(MockModule); // returns RealModule
 * getSourceOfMock(RealModule); // returns RealModule
 * ```
 */
export function getSourceOfMock<T>(declaration: AnyType<MockedModule<T>>): Type<T>;

/**
 * Returns the original class of a mock component class.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 *
 * ```ts
 * getSourceOfMock(MockComponent); // returns RealComponent
 * getSourceOfMock(RealComponent); // returns RealComponent
 * ```
 */
export function getSourceOfMock<T>(declaration: AnyType<MockedComponent<T>>): Type<T>;

/**
 * Returns the original class of a mock directive class.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 *
 * ```ts
 * getSourceOfMock(MockDirective); // returns RealDirective
 * getSourceOfMock(RealDirective); // returns RealDirective
 * ```
 */
export function getSourceOfMock<T>(declaration: AnyType<MockedDirective<T>>): Type<T>;

/**
 * Returns the original class of a mock pipe class.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 *
 * ```ts
 * getSourceOfMock(MockPipe); // returns RealPipe
 * getSourceOfMock(RealPipe); // returns RealPipe
 * ```
 */
export function getSourceOfMock<T>(declaration: AnyType<MockedPipe<T>>): Type<T>;

/**
 * Returns the original class of a mock class.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getSourceOfMock
 *
 * ```ts
 * getSourceOfMock(MockClass); // returns RealClass
 * getSourceOfMock(RealClass); // returns RealClass
 * ```
 */
export function getSourceOfMock<T>(declaration: AnyType<T>): Type<T>;

export function getSourceOfMock<T>(declaration: any): Type<T> {
  return typeof declaration === 'function' && declaration.mockOf ? declaration.mockOf : declaration;
}
