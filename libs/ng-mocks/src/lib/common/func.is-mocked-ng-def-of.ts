import { PipeTransform } from '@angular/core';

import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { Type } from './core.types';
import { isNgDef } from './func.is-ng-def';

/**
 * Checks whether a declaration is the mock class of a module.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockedNgDefOf
 *
 * ```ts
 * isMockedNgDefOf(MockModule, RealModule, 'm'); // returns true
 * isMockedNgDefOf(MockModule, ArbitraryModule, 'm'); // returns false
 * isMockedNgDefOf(MockModule, ArbitraryClass, 'm'); // returns false
 * ```
 */
export function isMockedNgDefOf<T>(declaration: any, type: Type<T>, ngType: 'm'): declaration is Type<MockedModule<T>>;

/**
 * Checks whether a declaration is the mock class of a component.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockedNgDefOf
 *
 * ```ts
 * isMockedNgDefOf(MockComponent, RealComponent, 'c'); // returns true
 * isMockedNgDefOf(MockComponent, ArbitraryComponent, 'c'); // returns false
 * isMockedNgDefOf(MockComponent, ArbitraryClass, 'c'); // returns false
 * ```
 */
export function isMockedNgDefOf<T>(
  declaration: any,
  type: Type<T>,
  ngType: 'c',
): declaration is Type<MockedComponent<T>>;

/**
 * Checks whether a declaration is the mock class of a directive.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockedNgDefOf
 *
 * ```ts
 * isMockedNgDefOf(MockDirective, RealDirective, 'd'); // returns true
 * isMockedNgDefOf(MockDirective, ArbitraryDirective, 'd'); // returns false
 * isMockedNgDefOf(MockDirective, ArbitraryClass, 'd'); // returns false
 * ```
 */
export function isMockedNgDefOf<T>(
  declaration: any,
  type: Type<T>,
  ngType: 'd',
): declaration is Type<MockedDirective<T>>;

/**
 * Checks whether a declaration is the mock class of a pipe.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockedNgDefOf
 *
 * ```ts
 * isMockedNgDefOf(MockPipe, RealPipe, 'p'); // returns true
 * isMockedNgDefOf(MockPipe, ArbitraryPipe, 'p'); // returns false
 * isMockedNgDefOf(MockPipe, ArbitraryClass, 'p'); // returns false
 * ```
 */
export function isMockedNgDefOf<T extends PipeTransform>(
  declaration: any,
  type: Type<T>,
  ngType: 'p',
): declaration is Type<MockedPipe<T>>;

/**
 * Checks whether a declaration is the mock class of a thing.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockedNgDefOf
 *
 * ```ts
 * isMockedNgDefOf(MockPipe, RealPipe); // returns true
 * isMockedNgDefOf(MockComponent, ArbitraryComponent); // returns false
 * isMockedNgDefOf(MockPipe, ArbitraryClass); // returns false
 * ```
 */
export function isMockedNgDefOf<T>(declaration: any, type: Type<T>): declaration is Type<T>;

export function isMockedNgDefOf<T>(declaration: any, type: Type<T>, ngType?: any): declaration is Type<T> {
  return (
    typeof declaration === 'function' && declaration.mockOf === type && (ngType ? isNgDef(declaration, ngType) : true)
  );
}
