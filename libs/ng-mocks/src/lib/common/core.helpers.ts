import { getTestBed } from '@angular/core/testing';

import coreDefineProperty from './core.define-property';
import coreReflectParametersResolve from './core.reflect.parameters-resolve';
import { AnyDeclaration, AnyType, Type } from './core.types';
import funcGetGlobal from './func.get-global';
import funcGetName from './func.get-name';
import ngMocksUniverse from './ng-mocks-universe';

/**
 * It will be removed from public interface with the next release: A14
 * Use ngMocks.get(token) instead.
 *
 * @deprecated
 * @internal
 */
export const getTestBedInjection = <I>(token: AnyDeclaration<I>): I | undefined => {
  try {
    // istanbul ignore next
    return getInjection(token);
  } catch {
    return undefined;
  }
};

/**
 * It will be removed from public interface with the next release: A14
 *
 * @deprecated
 * @internal
 */
export const getInjection = <I>(token: AnyDeclaration<I>): I => {
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
  // eslint-disable-next-line unicorn/no-array-for-each
  set.forEach((_, value: T) => result.push(value));

  return result;
};

export const mapValues = <T>(set: { forEach(a1: (value: T) => void): void }, destination?: Set<T>): T[] => {
  const result: T[] = [];
  if (destination) {
    // eslint-disable-next-line unicorn/no-array-for-each
    set.forEach((value: T) => {
      destination.add(value);
    });
  } else {
    // eslint-disable-next-line unicorn/no-array-for-each
    set.forEach((value: T) => {
      result.push(value);
    });
  }

  return result;
};

export const mapEntries = <K, T>(set: Map<K, T>, destination?: Map<K, T>): Array<[K, T]> => {
  const result: Array<[K, T]> = [];

  if (destination) {
    // eslint-disable-next-line unicorn/no-array-for-each
    set.forEach((value: T, key: K) => destination.set(key, value));
  } else {
    // eslint-disable-next-line unicorn/no-array-for-each
    set.forEach((value: T, key: K) => result.push([key, value]));
  }

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

export const extendClassicClass = <I>(base: AnyType<I>): Type<I> => {
  let child: any;
  const index = ngMocksUniverse.index();

  const glb = funcGetGlobal();
  glb.ngMocksParent = base;

  // First we try to eval es2015 style and if it fails to use es5 transpilation in the catch block.
  // The next step is to respect constructor parameters as the parent class via jitReflector.
  // istanbul ignore next
  try {
    eval(`
      var glb = typeof window === 'undefined' ? global : window;
      class MockMiddleware${index} extends glb.ngMocksParent {};
      glb.ngMocksResult = MockMiddleware${index};
    `);
    child = glb.ngMocksResult;
  } catch {
    class MockMiddleware extends glb.ngMocksParent {}
    child = MockMiddleware;
  } finally {
    glb.ngMocksResult = undefined;
    glb.ngMocksParent = undefined;
  }

  // A16: adding unique property.
  coreDefineProperty(child.prototype, `__ngMocks_index_${index}`, undefined, false);

  return child;
};

export const extendClass = <I>(base: AnyType<I>): Type<I> => {
  const child: Type<I> = extendClassicClass(base);
  coreDefineProperty(child, 'name', `MockMiddleware${funcGetName(base)}`, true);

  const parameters = coreReflectParametersResolve(base);
  if (parameters.length > 0) {
    coreDefineProperty(child, 'parameters', [...parameters]);
  }

  return child;
};
