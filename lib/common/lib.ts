import { InjectionToken, PipeTransform, Provider } from '@angular/core';
import { getTestBed, MetadataOverride } from '@angular/core/testing';

import { MockedComponent } from '../mock-component';
import { MockedDirective } from '../mock-directive';
import { MockedModule } from '../mock-module';
import { MockedPipe } from '../mock-pipe';

import { ngMocksUniverse } from './ng-mocks-universe';
import { jitReflector } from './reflect';

// It has to be an interface.
// tslint:disable-next-line:interface-name
export interface AbstractType<T> extends Function {
  prototype: T;
}

// It has to be an interface.
// tslint:disable-next-line:interface-name
export interface Type<T> extends Function {
  // tslint:disable-next-line:callable-types
  new (...args: any[]): T;
}

export type AnyType<T> = Type<T> | AbstractType<T>;

// remove after removal of A5 support
// tslint:disable-next-line:interface-name
export interface NgModuleWithProviders<T = any> {
  ngModule: Type<T>;
  providers?: Provider[];
}

export const NG_MOCKS = new InjectionToken<Map<any, any>>('NG_MOCKS');
export const NG_MOCKS_TOUCHES = new InjectionToken<Set<any>>('NG_MOCKS_TOUCHES');
export const NG_MOCKS_OVERRIDES = new InjectionToken<Map<Type<any> | AbstractType<any>, MetadataOverride<any>>>(
  'NG_MOCKS_OVERRIDES'
);

/**
 * Can be changed any time.
 *
 * @internal
 */
export const getTestBedInjection = <I>(token: Type<I> | InjectionToken<I>): I | undefined => {
  const testBed: any = getTestBed();
  try {
    /* istanbul ignore next */
    return testBed.inject ? testBed.inject(token) : testBed.get(token);
  } catch (e) {
    return undefined;
  }
};

export const flatten = <T>(values: T | T[], result: T[] = []): T[] => {
  if (Array.isArray(values)) {
    values.forEach((value: T | T[]) => flatten(value, result));
  } else {
    result.push(values);
  }
  return result;
};

export const mapKeys = <T>(set: Map<T, any>): T[] => {
  const result: T[] = [];
  set.forEach((_, value: T) => result.push(value));
  return result;
};

export const mapValues = <T>(set: { forEach(a1: (value: T) => void): void }): T[] => {
  const result: T[] = [];
  set.forEach((value: T) => result.push(value));
  return result;
};

export const mapEntries = <K, T>(set: Map<K, T>): Array<[K, T]> => {
  const result: Array<[K, T]> = [];
  set.forEach((value: T, key: K) => result.push([key, value]));
  return result;
};

export const extendClass = <I extends object>(base: Type<I>): Type<I> => {
  let child: any;
  const parent: any = base;

  // first we try to eval es2015 style and if it fails to use es5 transpilation in the catch block.
  (window as any).ngMocksParent = parent;
  /* istanbul ignore next */
  try {
    // tslint:disable-next-line:no-eval
    eval(`
        class child extends window.ngMocksParent {
        }
        window.ngMocksResult = child
      `);
    child = (window as any).ngMocksResult;
  } catch (e) {
    class ClassEs5 extends parent {}
    child = ClassEs5;
  }
  (window as any).ngMocksParent = undefined;

  // the next step is to respect constructor parameters as the parent class.
  child.parameters = jitReflector
    .parameters(parent)
    .map(parameter => ngMocksUniverse.cacheMocks.get(parameter) || parameter);

  return child;
};

export const isNgType = (object: Type<any>, type: string): boolean =>
  jitReflector.annotations(object).some(annotation => annotation.ngMetadataName === type);

/**
 * Checks whether a class was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isNgDef(object: any, ngType: 'm' | 'c' | 'd'): object is Type<any>;
export function isNgDef(object: any, ngType: 'p'): object is Type<PipeTransform>;
export function isNgDef(object: any): object is Type<any>;
export function isNgDef(object: any, ngType?: string): object is Type<any> {
  const isModule = (!ngType || ngType === 'm') && isNgType(object, 'NgModule');
  const isComponent = (!ngType || ngType === 'c') && isNgType(object, 'Component');
  const isDirective = (!ngType || ngType === 'd') && isNgType(object, 'Directive');
  const isPipe = (!ngType || ngType === 'p') && isNgType(object, 'Pipe');
  return isModule || isComponent || isDirective || isPipe;
}

/**
 * Checks whether a class is a mock of a class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isMockedNgDefOf<T>(object: any, type: Type<T>, ngType: 'm'): object is Type<MockedModule<T>>;
export function isMockedNgDefOf<T>(object: any, type: Type<T>, ngType: 'c'): object is Type<MockedComponent<T>>;
export function isMockedNgDefOf<T>(object: any, type: Type<T>, ngType: 'd'): object is Type<MockedDirective<T>>;
export function isMockedNgDefOf<T extends PipeTransform>(
  object: any,
  type: Type<T>,
  ngType: 'p'
): object is Type<MockedPipe<T>>;
export function isMockedNgDefOf<T>(object: any, type: Type<T>): object is Type<T>;
export function isMockedNgDefOf<T>(object: any, type: Type<T>, ngType?: any): object is Type<T> {
  return typeof object === 'function' && object.mockOf === type && (ngType ? isNgDef(object, ngType) : true);
}

export const isNgInjectionToken = (object: any): object is InjectionToken<any> =>
  typeof object === 'object' && object.ngMetadataName === 'InjectionToken';

// Checks if an object implements ModuleWithProviders.
export const isNgModuleDefWithProviders = (object: any): object is NgModuleWithProviders =>
  object.ngModule !== undefined && isNgDef(object.ngModule, 'm');

/**
 * Checks whether an object is an instance of a mocked class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isMockOf<T>(object: any, type: Type<T>, ngType: 'm'): object is MockedModule<T>;
export function isMockOf<T>(object: any, type: Type<T>, ngType: 'c'): object is MockedComponent<T>;
export function isMockOf<T>(object: any, type: Type<T>, ngType: 'd'): object is MockedDirective<T>;
export function isMockOf<T extends PipeTransform>(object: any, type: Type<T>, ngType: 'p'): object is MockedPipe<T>;
export function isMockOf<T>(object: any, type: Type<T>): object is T;
export function isMockOf<T>(object: any, type: Type<T>, ngType?: any): object is T {
  return (
    typeof object === 'object' &&
    object.__ngMocksMock &&
    object.constructor === type &&
    (ngType ? isNgDef(object.constructor, ngType) : isNgDef(object.constructor))
  );
}

/**
 * Returns a def of a mocked class based on another mock class or a source class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function getMockedNgDefOf<T>(type: Type<T>, ngType: 'm'): Type<MockedModule<T>>;
export function getMockedNgDefOf<T>(type: Type<T>, ngType: 'c'): Type<MockedComponent<T>>;
export function getMockedNgDefOf<T>(type: Type<T>, ngType: 'd'): Type<MockedDirective<T>>;
export function getMockedNgDefOf<T>(type: Type<T>, ngType: 'p'): Type<MockedPipe<T>>;
export function getMockedNgDefOf(type: Type<any>): Type<any>;
export function getMockedNgDefOf(type: any, ngType?: any): any {
  const source = type.mockOf ? type.mockOf : type;
  const mocks = getTestBedInjection(NG_MOCKS);

  let mock: any;

  // If mocks exists, we are in the MockBuilder env and it's enough for the check.
  if (mocks && mocks.has(source)) {
    mock = mocks.get(source);
  } else if (mocks) {
    throw new Error(`There is no mock for ${source.name}`);
  }

  // If we are not in the MockBuilder env we can rely on the current cache.
  if (!mock && source !== type) {
    mock = type;
  } else if (!mock && ngMocksUniverse.cacheMocks.has(source)) {
    mock = ngMocksUniverse.cacheMocks.get(source);
  }

  if (mock && !ngType) {
    return mock;
  }
  if (mock && ngType && isMockedNgDefOf(mock, source, ngType)) {
    return mock;
  }

  // Looks like the def hasn't been mocked.
  throw new Error(`There is no mock for ${source.name}`);
}

export function getSourceOfMock<T>(type: Type<MockedModule<T>>): Type<T>;
export function getSourceOfMock<T>(type: Type<MockedComponent<T>>): Type<T>;
export function getSourceOfMock<T>(type: Type<MockedDirective<T>>): Type<T>;
export function getSourceOfMock<T>(type: Type<MockedPipe<T>>): Type<T>;
export function getSourceOfMock<T>(type: Type<T>): Type<T>;
export function getSourceOfMock<T>(type: any): Type<T> {
  return typeof type === 'function' && type.mockOf ? type.mockOf : type;
}
