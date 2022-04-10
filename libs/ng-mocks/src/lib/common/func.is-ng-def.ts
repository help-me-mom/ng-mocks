import { InjectionToken, PipeTransform } from '@angular/core';

import { Type } from './core.types';
import { isNgInjectionToken } from './func.is-ng-injection-token';
import { isNgType } from './func.is-ng-type';

const isModuleCheck = (def: any, ngType?: string): boolean => (!ngType || ngType === 'm') && isNgType(def, 'NgModule');
const isComponentCheck = (def: any, ngType?: string): boolean =>
  (!ngType || ngType === 'c') && isNgType(def, 'Component');
const isDirectiveCheck = (def: any, ngType?: string): boolean =>
  (!ngType || ngType === 'd') && isNgType(def, 'Directive');
const isPipeCheck = (def: any, ngType?: string): boolean => (!ngType || ngType === 'p') && isNgType(def, 'Pipe');
const isInjectableCheck = (def: any, ngType?: string): boolean =>
  (!ngType || ngType === 'i') && isNgType(def, 'Injectable');

/**
 * Checks whether a class has been decorated by @NgModule.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgDef
 *
 * ```ts
 * isNgDef(RealModule, 'm'); // returns true
 * isNgDef(MockModule, 'm'); // returns true
 * isNgDef(ArbitraryModule, 'm'); // returns true
 * isNgDef(ArbitraryClass, 'm'); // returns false
 * ```
 */
export function isNgDef(declaration: any, ngType: 'm'): declaration is Type<any>;

/**
 * Checks whether a class has been decorated by @Component.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgDef
 *
 * ```ts
 * isNgDef(RealComponent, 'c'); // returns true
 * isNgDef(MockComponent, 'c'); // returns true
 * isNgDef(ArbitraryComponent, 'c'); // returns true
 * isNgDef(ArbitraryClass, 'c'); // returns false
 * ```
 */
export function isNgDef(declaration: any, ngType: 'c'): declaration is Type<any>;

/**
 * Checks whether a class has been decorated by @Directive.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgDef
 *
 * ```ts
 * isNgDef(RealDirective, 'd'); // returns true
 * isNgDef(MockDirective, 'd'); // returns true
 * isNgDef(ArbitraryDirective, 'd'); // returns true
 * isNgDef(ArbitraryClass, 'd'); // returns false
 * ```
 */
export function isNgDef(declaration: any, ngType: 'd'): declaration is Type<any>;

/**
 * Checks whether a class has been decorated by @Pipe.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgDef
 *
 * ```ts
 * isNgDef(RealPipe, 'p'); // returns true
 * isNgDef(MockPipe, 'p'); // returns true
 * isNgDef(ArbitraryPipe, 'p'); // returns true
 * isNgDef(ArbitraryClass, 'p'); // returns false
 * ```
 */
export function isNgDef(declaration: any, ngType: 'p'): declaration is Type<PipeTransform>;

/**
 * Checks whether a class has been decorated by @Injectable.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgDef
 *
 * ```ts
 * isNgDef(RealService, 'i'); // returns true
 * isNgDef(MockService, 'i'); // returns true
 * isNgDef(ArbitraryService, 'i'); // returns true
 * isNgDef(ArbitraryClass, 'i'); // returns false
 * ```
 */
export function isNgDef(declaration: any, ngType: 'i'): declaration is Type<any>;

/**
 * Checks whether a variable is a token.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgDef
 *
 * ```ts
 * isNgDef(realToken, 't'); // returns true
 * isNgDef(mockToken, 't'); // returns true
 * isNgDef(arbitraryToken, 't'); // returns true
 * isNgDef(arbitraryObject, 't'); // returns false
 * ```
 */
export function isNgDef(declaration: any, ngType: 't'): declaration is InjectionToken<any>;

/**
 * Checks whether a class or variable has been decorated by a ng type.
 *
 * @see https://ng-mocks.sudo.eu/api/helpers/isNgDef
 *
 * ```ts
 * isNgDef(RealModule); // returns true
 * isNgDef(MockComponent); // returns true
 * isNgDef(ArbitraryDirective); // returns true
 * isNgDef(token); // returns true
 * isNgDef(ArbitraryClass); // returns false
 * ```
 */
export function isNgDef(declaration: any): declaration is Type<any>;

export function isNgDef(declaration: any, ngType?: string): declaration is Type<any> {
  if (ngType === 't') {
    return isNgInjectionToken(declaration);
  }
  if (typeof declaration !== 'function') {
    return false;
  }

  const isModule = isModuleCheck(declaration, ngType);
  const isComponent = isComponentCheck(declaration, ngType);
  const isDirective = isDirectiveCheck(declaration, ngType);
  const isPipe = isPipeCheck(declaration, ngType);
  const isInjectable = isInjectableCheck(declaration, ngType);

  return isModule || isComponent || isDirective || isPipe || isInjectable;
}
