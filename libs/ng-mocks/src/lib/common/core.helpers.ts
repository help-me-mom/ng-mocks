import { getTestBed } from '@angular/core/testing';

import coreDefineProperty from './core.define-property';
import coreReflectParametersResolve from './core.reflect.parameters-resolve';
import { AnyDeclaration, AnyType, Type } from './core.types';
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
  return testBed.inject ? testBed.inject(token) : (testBed as any).get(token);
};

export const flatten = <T>(values: T | T[] | { ɵproviders: T[] }, result: T[] = []): T[] => {
  if (Array.isArray(values)) {
    for (const value of values) {
      flatten(value, result);
    }
  } else if (values !== null && typeof values === 'object' && Array.isArray((values as any).ɵproviders)) {
    for (const value of (values as any).ɵproviders) {
      flatten(value, result);
    }
  } else {
    // any is needed to cover ɵproviders
    result.push(values as any);
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
  const index = ngMocksUniverse.index();
  const construct = typeof Reflect !== 'undefined' && typeof Reflect.construct === 'function' && Reflect.construct;

  class MockMiddleware extends (base as any) {
    public constructor(...args: any[]) {
      // The ES5 bundle must construct native Angular classes instead of calling apply.
      if (construct) {
        return construct(base, args, new.target);
      }
      super(...args);
    }
  }

  let child: any = MockMiddleware;
  if (construct && typeof Proxy === 'function') {
    // ES5 lowers new.target to this.constructor, which a derived prototype can override.
    child = new Proxy(MockMiddleware, {
      construct: (_target, args, newTarget) => construct(base, args, newTarget),
    });
    coreDefineProperty(child.prototype, 'constructor', child);
    // Angular 5 reads toString, but Node 8 cannot stringify a callable Proxy.
    if (MockMiddleware.toString === Function.prototype.toString) {
      coreDefineProperty(child, 'toString', MockMiddleware.toString.bind(MockMiddleware));
    }
  }

  // A16: adding unique property.
  coreDefineProperty(child.prototype, `__ngMocks_index_${index}`, undefined, false);

  return child;
};

export const extendClass = <I>(base: AnyType<I>): Type<I> => {
  const child: Type<I> = extendClassicClass(base);
  coreDefineProperty(child, 'name', `MockMiddleware${funcGetName(base)}`, true);
  // Cloned declarations are decorated again. Shadow inherited Ivy defs first so
  // Angular does not read the original declaration metadata from the subclass.
  for (const prop of ['ɵcmp', 'ɵdir', 'ɵfac', 'ɵinj', 'ɵmod', 'ɵpipe']) {
    if (prop in child && !Object.prototype.hasOwnProperty.call(child, prop)) {
      coreDefineProperty(child, prop, undefined);
    }
  }

  const parameters = coreReflectParametersResolve(base);
  if (parameters.length > 0) {
    coreDefineProperty(child, 'parameters', [...parameters]);
  }

  return child;
};
