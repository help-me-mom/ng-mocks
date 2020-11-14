import { PipeTransform } from '@angular/core';

import { Type } from './core.types';
import { isNgType } from './func.is-ng-type';

/**
 * Checks whether a class was decorated by @NgModule.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'm'): declaration is Type<any>;

/**
 * Checks whether a class was decorated by @Component.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'c'): declaration is Type<any>;

/**
 * Checks whether a class was decorated by @Directive.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'd'): declaration is Type<any>;

/**
 * Checks whether a class was decorated by @Pipe.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'p'): declaration is Type<PipeTransform>;

/**
 * Checks whether a class was decorated by @Injectable.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any, ngType: 'i'): declaration is Type<any>;

/**
 * Checks whether a class was decorated by a ng type.
 *
 * @see https://github.com/ike18t/ng-mocks#isngdef
 */
export function isNgDef(declaration: any): declaration is Type<any>;

export function isNgDef(declaration: any, ngType?: string): declaration is Type<any> {
  const isModule = (!ngType || ngType === 'm') && isNgType(declaration, 'NgModule');
  const isComponent = (!ngType || ngType === 'c') && isNgType(declaration, 'Component');
  const isDirective = (!ngType || ngType === 'd') && isNgType(declaration, 'Directive');
  const isPipe = (!ngType || ngType === 'p') && isNgType(declaration, 'Pipe');
  const isInjectable = (!ngType || ngType === 'i') && isNgType(declaration, 'Injectable');
  return isModule || isComponent || isDirective || isPipe || isInjectable;
}
