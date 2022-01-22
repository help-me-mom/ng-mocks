import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import coreInjector from './core.injector';
import { NG_MOCKS } from './core.tokens';
import { AnyType, Type } from './core.types';
import { isMockedNgDefOf } from './func.is-mocked-ng-def-of';
import ngMocksUniverse from './ng-mocks-universe';

const getMock = (declaration: any, source: any, mocks?: Map<any, any>) => {
  if (mocks && !mocks.has(source)) {
    throw new Error(`There is no mock for ${source.name}`);
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
 * Returns a def of a mock module based on a mock module or a source module.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>, type: 'm'): Type<MockedModule<T>>;

/**
 * Returns a def of a mock component based on a mock component or a source component.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>, type: 'c'): Type<MockedComponent<T>>;

/**
 * Returns a def of a mock directive based on a mock directive or a source directive.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>, type: 'd'): Type<MockedDirective<T>>;

/**
 * Returns a def of a mock pipe based on a mock pipe or a source pipe.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 */
export function getMockedNgDefOf<T>(declaration: AnyType<T>, type: 'p'): Type<MockedPipe<T>>;

/**
 * Returns a def of a mock class based on a mock class or a source class decorated by a ng type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/getMockedNgDefOf
 */
export function getMockedNgDefOf(declaration: AnyType<any>): Type<any>;

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

  throw new Error(`There is no mock for ${source.name}`);
}
