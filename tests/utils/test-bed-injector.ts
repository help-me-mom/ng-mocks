import { Type, InjectionToken } from '@angular/core';
import { TestBed } from '@angular/core/testing';

/* A7 */
export interface NgAbstractType<T> extends Function {
  prototype: T;
}

export interface TestBedInjector<T = any> {
  (token: any, notFoundValue?: any): any;
}
export interface TestBedInjector<T = any> {
  (token: Type<T> | InjectionToken<T>, notFoundValue?: T, flags?: any): any;
}
export interface TestBedInjector<T = any> {
  (token: Type<T> | InjectionToken<T> | NgAbstractType<T>, notFoundValue?: T, flags?: any): T;
}
export interface TestBedInjector<T = any> {
  (token: Type<T> | InjectionToken<T> | NgAbstractType<T>, notFoundValue: null, flags?: any): T | null;
}

export const testBedInjector: TestBedInjector = /*A5*/ (<any>TestBed)['inject']
  ? /*A5*/ (<any>TestBed)['inject']
  : TestBed['get'];
