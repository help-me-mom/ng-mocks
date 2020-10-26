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
export const NG_GUARDS = new InjectionToken<void>('NG_MOCKS_GUARDS');
export const NG_INTERCEPTORS = new InjectionToken<void>('NG_MOCKS_INTERCEPTORS');

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

export const isNgType = (declaration: Type<any>, type: string): boolean =>
  jitReflector.annotations(declaration).some(annotation => annotation.ngMetadataName === type);

/**
 * Checks whether a class was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isNgDef(declaration: any, ngType: 'm' | 'c' | 'd'): declaration is Type<any>;
export function isNgDef(declaration: any, ngType: 'p'): declaration is Type<PipeTransform>;
export function isNgDef(declaration: any): declaration is Type<any>;
export function isNgDef(declaration: any, ngType?: string): declaration is Type<any> {
  const isModule = (!ngType || ngType === 'm') && isNgType(declaration, 'NgModule');
  const isComponent = (!ngType || ngType === 'c') && isNgType(declaration, 'Component');
  const isDirective = (!ngType || ngType === 'd') && isNgType(declaration, 'Directive');
  const isPipe = (!ngType || ngType === 'p') && isNgType(declaration, 'Pipe');
  return isModule || isComponent || isDirective || isPipe;
}

/**
 * Checks whether a class is a mock of a class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isMockedNgDefOf<T>(declaration: any, type: Type<T>, ngType: 'm'): declaration is Type<MockedModule<T>>;
export function isMockedNgDefOf<T>(
  declaration: any,
  type: Type<T>,
  ngType: 'c'
): declaration is Type<MockedComponent<T>>;
export function isMockedNgDefOf<T>(
  declaration: any,
  type: Type<T>,
  ngType: 'd'
): declaration is Type<MockedDirective<T>>;
export function isMockedNgDefOf<T extends PipeTransform>(
  declaration: any,
  type: Type<T>,
  ngType: 'p'
): declaration is Type<MockedPipe<T>>;
export function isMockedNgDefOf<T>(declaration: any, type: Type<T>): declaration is Type<T>;
export function isMockedNgDefOf<T>(declaration: any, type: Type<T>, ngType?: any): declaration is Type<T> {
  return (
    typeof declaration === 'function' && declaration.mockOf === type && (ngType ? isNgDef(declaration, ngType) : true)
  );
}

export const isNgInjectionToken = (token: any): token is InjectionToken<any> =>
  typeof token === 'object' && token.ngMetadataName === 'InjectionToken';

// Checks if an object implements ModuleWithProviders.
export const isNgModuleDefWithProviders = (declaration: any): declaration is NgModuleWithProviders =>
  declaration.ngModule !== undefined && isNgDef(declaration.ngModule, 'm');

/**
 * Checks whether an object is an instance of a mocked class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function isMockOf<T>(instance: any, declaration: Type<T>, ngType: 'm'): instance is MockedModule<T>;
export function isMockOf<T>(instance: any, declaration: Type<T>, ngType: 'c'): instance is MockedComponent<T>;
export function isMockOf<T>(instance: any, declaration: Type<T>, ngType: 'd'): instance is MockedDirective<T>;
export function isMockOf<T extends PipeTransform>(
  instance: any,
  declaration: Type<T>,
  ngType: 'p'
): instance is MockedPipe<T>;
export function isMockOf<T>(instance: any, declaration: Type<T>): instance is T;
export function isMockOf<T>(instance: any, declaration: Type<T>, ngType?: any): instance is T {
  return (
    typeof instance === 'object' &&
    instance.__ngMocksMock &&
    instance.constructor === declaration &&
    (ngType ? isNgDef(instance.constructor, ngType) : isNgDef(instance.constructor))
  );
}

/**
 * Returns a def of a mocked class based on another mock class or a source class that was decorated by a ng type.
 * m - module.
 * c - component.
 * d - directive.
 * p - pipe.
 */
export function getMockedNgDefOf<T>(declaration: Type<T>, type: 'm'): Type<MockedModule<T>>;
export function getMockedNgDefOf<T>(declaration: Type<T>, type: 'c'): Type<MockedComponent<T>>;
export function getMockedNgDefOf<T>(declaration: Type<T>, type: 'd'): Type<MockedDirective<T>>;
export function getMockedNgDefOf<T>(declaration: Type<T>, type: 'p'): Type<MockedPipe<T>>;
export function getMockedNgDefOf(declaration: Type<any>): Type<any>;
export function getMockedNgDefOf(declaration: any, type?: any): any {
  const source = declaration.mockOf ? declaration.mockOf : declaration;
  const mocks = getTestBedInjection(NG_MOCKS);

  let mock: any;

  // If mocks exists, we are in the MockBuilder env and it's enough for the check.
  if (mocks && mocks.has(source)) {
    mock = mocks.get(source);
  } else if (mocks) {
    throw new Error(`There is no mock for ${source.name}`);
  }

  // If we are not in the MockBuilder env we can rely on the current cache.
  if (!mock && source !== declaration) {
    mock = declaration;
  } else if (!mock && ngMocksUniverse.cacheMocks.has(source)) {
    mock = ngMocksUniverse.cacheMocks.get(source);
  }

  if (mock && !type) {
    return mock;
  }
  if (mock && type && isMockedNgDefOf(mock, source, type)) {
    return mock;
  }

  // Looks like the def hasn't been mocked.
  throw new Error(`There is no mock for ${source.name}`);
}

export function getSourceOfMock<T>(declaration: Type<MockedModule<T>>): Type<T>;
export function getSourceOfMock<T>(declaration: Type<MockedComponent<T>>): Type<T>;
export function getSourceOfMock<T>(declaration: Type<MockedDirective<T>>): Type<T>;
export function getSourceOfMock<T>(declaration: Type<MockedPipe<T>>): Type<T>;
export function getSourceOfMock<T>(declaration: Type<T>): Type<T>;
export function getSourceOfMock<T>(declaration: any): Type<T> {
  return typeof declaration === 'function' && declaration.mockOf ? declaration.mockOf : declaration;
}
