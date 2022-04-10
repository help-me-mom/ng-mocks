import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import coreInjector from './core.injector';
import { NG_MOCKS } from './core.tokens';
import { AnyType, Type } from './core.types';
import funcGetName from './func.get-name';
import { isMockedNgDefOf } from './func.is-mocked-ng-def-of';
import ngMocksUniverse from './ng-mocks-universe';

const getMock = (declaration: any, source: any, mocks?: Map<any, any>) => {
  if (mocks && !mocks.has(source)) {
    throw new Error(`There is no mock for ${funcGetName(source)}`);
  }
  let mock = mocks ? mocks.get(source) : undefined;
  if (mock === source) {
    mock = undefined;
  }

  // If we are not in the MockBuilder env we can rely on the current cache.
  if (!mock && source !== declaration) {
    mock = declaration;
  } else if (!mock && ngMocksUniverse.cacheDeclarations.has(source)) {
    mock = ngMocksUniverse.cacheDeclarations.get(source);
  }

  return mock;
};

/**
 * Returns the mock class of a mock module based on a mock module or a source module.
 * It works in runtime if the module has been mocked.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 *
 * ```ts
 * getMockedNgDefOf(RealModule, 'm'); // returns MockModule
 * getMockedNgDefOf(MockModule, 'm'); // returns MockModule
 * getMockedNgDefOf(ArbitraryClass, 'm'); // throws
 * ```
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>, type: 'm'): Type<MockedModule<T>>;

/**
 * Returns the mock class of a mock component based on a mock component or a source component.
 * It works in runtime if the component has been mocked.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 *
 * ```ts
 * getMockedNgDefOf(RealComponent, 'c'); // returns MockComponent
 * getMockedNgDefOf(MockComponent, 'c'); // returns MockComponent
 * getMockedNgDefOf(ArbitraryClass, 'c'); // throws
 * ```
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>, type: 'c'): Type<MockedComponent<T>>;

/**
 * Returns the mock class of a mock directive based on a mock directive or a source directive.
 * It works in runtime if the directive has been mocked.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 *
 * ```ts
 * getMockedNgDefOf(RealDirective, 'd'); // returns MockDirective
 * getMockedNgDefOf(MockDirective, 'd'); // returns MockDirective
 * getMockedNgDefOf(ArbitraryClass, 'd'); // throws
 * ```
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>, type: 'd'): Type<MockedDirective<T>>;

/**
 * Returns the mock class of a mock pipe based on a mock pipe or a source pipe.
 * It works in runtime if the pipe has been mocked.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 *
 * ```ts
 * getMockedNgDefOf(RealPipe, 'p'); // returns MockPipe
 * getMockedNgDefOf(MockPipe, 'p'); // returns MockPipe
 * getMockedNgDefOf(ArbitraryClass, 'p'); // throws
 * ```
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>, type: 'p'): Type<MockedPipe<T>>;

/**
 * Returns the mock class of a thing based on a mock class or a source class.
 * It works in runtime if the thing has been mocked.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 *
 * ```ts
 * getMockedNgDefOf(RealComponent); // returns MockComponent
 * getMockedNgDefOf(MockPipe); // returns MockPipe
 * getMockedNgDefOf(ArbitraryClass); // throws
 * ```
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>): Type<T>;

export function getMockedNgDefOf(declaration: any, type?: any): any {
  const source = declaration.mockOf ? declaration.mockOf : declaration;
  const mocks = coreInjector(NG_MOCKS);

  const mock = getMock(declaration, source, mocks);
  if (mock && !type) {
    return mock;
  }
  if (mock && type && isMockedNgDefOf(mock, source, type)) {
    return mock;
  }

  throw new Error(`There is no mock for ${funcGetName(source)}`);
}
