import { InjectionToken } from '@angular/core';
import { getTestBed } from '@angular/core/testing';

import coreDefineProperty from './core.define-property';
import coreReflectJit from './core.reflect.jit';
import { AnyType, Type } from './core.types';

export const getTestBedInjection = <I>(token: AnyType<I> | InjectionToken<I>): I | undefined => {
  const testBed: any = getTestBed();
  try {
    // istanbul ignore next
    return testBed.inject ? testBed.inject(token) : testBed.get(token);
  } catch (e) {
    return undefined;
  }
};

export const getInjection = <I>(token: Type<I> | InjectionToken<I>): I => {
  const testBed: any = getTestBed();

  // istanbul ignore next
  return testBed.inject ? testBed.inject(token) : testBed.get(token);
};

export const flatten = <T>(values: T | T[], result: T[] = []): T[] => {
  if (Array.isArray(values)) {
    for (const value of values) {
      flatten(value, result);
    }
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

const extractDependencyArray = (deps: any[], set: Set<any>): void => {
  for (const flag of deps) {
    const name = flag && typeof flag === 'object' ? flag.ngMetadataName : undefined;
    if (name === 'Optional' || name === 'SkipSelf' || name === 'Self') {
      continue;
    }
    set.add(flag);
  }
};

// Accepts an array of dependencies from providers, skips injections flags,
// and adds the providers to the set.
export const extractDependency = (deps: any[], set?: Set<any>): void => {
  if (!set) {
    return;
  }
  for (const dep of deps) {
    if (!Array.isArray(dep)) {
      set.add(dep);
      continue;
    }
    extractDependencyArray(dep, set);
  }
};

const extendClassicClass = <I extends object>(base: AnyType<I>): Type<I> => {
  let child: any;

  // First we try to eval es2015 style and if it fails to use es5 transpilation in the catch block.
  // The next step is to respect constructor parameters as the parent class via jitReflector.
  (window as any).ngMocksParent = base;
  // istanbul ignore next
  try {
    // tslint:disable-next-line no-eval
    eval(`
      class MockMiddleware extends window.ngMocksParent {}
      window.ngMocksResult = MockMiddleware
    `);
    child = (window as any).ngMocksResult;
  } catch (e) {
    class MockMiddleware extends (window as any).ngMocksParent {}
    child = MockMiddleware;
  }
  (window as any).ngMocksParent = undefined;

  return child;
};

export const extendClass = <I extends object>(base: AnyType<I>): Type<I> => {
  const child: Type<I> = extendClassicClass(base);
  coreDefineProperty(child, 'name', `MockMiddleware${base.name}`, true);

  const parameters = coreReflectJit().parameters(base);
  if (parameters.length) {
    coreDefineProperty(child, 'parameters', [...parameters]);
  }

  return child;
};
