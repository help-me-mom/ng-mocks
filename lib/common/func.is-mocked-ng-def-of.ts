import { PipeTransform } from '@angular/core';

import { MockedComponent } from '../mock-component/types';
import { MockedDirective } from '../mock-directive/types';
import { MockedModule } from '../mock-module/types';
import { MockedPipe } from '../mock-pipe/types';

import { Type } from './core.types';
import { isNgDef } from './func.is-ng-def';

/**
 * Checks whether the declaration is a mocked one and derives from the specified module.
 *
 * @see https://github.com/ike18t/ng-mocks#ismockedngdefof
 */
export function isMockedNgDefOf<T>(declaration: any, type: Type<T>, ngType: 'm'): declaration is Type<MockedModule<T>>;

/**
 * Checks whether the declaration is a mocked one and derives from the specified component.
 *
 * @see https://github.com/ike18t/ng-mocks#ismockedngdefof
 */
export function isMockedNgDefOf<T>(
  declaration: any,
  type: Type<T>,
  ngType: 'c'
): declaration is Type<MockedComponent<T>>;

/**
 * Checks whether the declaration is a mocked one and derives from the specified directive.
 *
 * @see https://github.com/ike18t/ng-mocks#ismockedngdefof
 */
export function isMockedNgDefOf<T>(
  declaration: any,
  type: Type<T>,
  ngType: 'd'
): declaration is Type<MockedDirective<T>>;

/**
 * Checks whether the declaration is a mocked one and derives from the specified pipe.
 *
 * @see https://github.com/ike18t/ng-mocks#ismockedngdefof
 */
export function isMockedNgDefOf<T extends PipeTransform>(
  declaration: any,
  type: Type<T>,
  ngType: 'p'
): declaration is Type<MockedPipe<T>>;

/**
 * Checks whether the declaration is a mocked one and derives from the specified type.
 *
 * @see https://github.com/ike18t/ng-mocks#ismockedngdefof
 */
export function isMockedNgDefOf<T>(declaration: any, type: Type<T>): declaration is Type<T>;

export function isMockedNgDefOf<T>(declaration: any, type: Type<T>, ngType?: any): declaration is Type<T> {
  return (
    typeof declaration === 'function' && declaration.mockOf === type && (ngType ? isNgDef(declaration, ngType) : true)
  );
}
