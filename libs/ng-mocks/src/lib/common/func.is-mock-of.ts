import { PipeTransform } from '@angular/core';

import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { Type } from './core.types';
import funcIsMock from './func.is-mock';
import { isNgDef } from './func.is-ng-def';

/**
 * Checks whether the instance derives from a mock module.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockOf
 *
 * ```ts
 * isMockOf(moduleInstance, RealModule, 'm'); // returns true
 * isMockOf(moduleInstance, ArbitraryClass, 'm'); // returns false
 * ```
 */
export function isMockOf<T>(instance: any, declaration: Type<T>, ngType: 'm'): instance is MockedModule<T>;

/**
 * Checks whether the instance derives from a mock component.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockOf
 *
 * ```ts
 * isMockOf(componentInstance, RealComponent, 'c'); // returns true
 * isMockOf(componentInstance, ArbitraryClass, 'c'); // returns false
 * ```
 */
export function isMockOf<T>(instance: any, declaration: Type<T>, ngType: 'c'): instance is MockedComponent<T>;

/**
 * Checks whether the instance derives from a mock directive.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockOf
 *
 * ```ts
 * isMockOf(directiveInstance, RealDirective, 'd'); // returns true
 * isMockOf(directiveInstance, ArbitraryClass, 'd'); // returns false
 * ```
 */
export function isMockOf<T>(instance: any, declaration: Type<T>, ngType: 'd'): instance is MockedDirective<T>;

/**
 * Checks whether the instance derives from a mock pipe.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockOf
 *
 * ```ts
 * isMockOf(pipeInstance, RealPipe, 'p'); // returns true
 * isMockOf(pipeInstance, ArbitraryClass, 'p'); // returns false
 * ```
 */
export function isMockOf<T extends PipeTransform>(
  instance: any,
  declaration: Type<T>,
  ngType: 'p',
): instance is MockedPipe<T>;

/**
 * Checks whether the instance derives from a mock type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isMockOf
 *
 * ```ts
 * isMockOf(componentInstance, RealComponent); // returns true
 * isMockOf(pipeInstance, RealPipe); // returns true
 * isMockOf(pipeInstance, ArbitraryClass); // returns false
 * ```
 */
export function isMockOf<T>(instance: any, declaration: Type<T>): instance is T;

export function isMockOf<T>(instance: any, declaration: Type<T>, ngType?: any): instance is T {
  return (
    funcIsMock(instance) &&
    instance.constructor === declaration &&
    (ngType ? isNgDef(instance.constructor, ngType) : isNgDef(instance.constructor))
  );
}
