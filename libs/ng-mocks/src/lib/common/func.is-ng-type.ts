import collectDeclarations from '../resolve/collect-declarations';

import { AnyType } from './core.types';

/**
 * Checks whether a class has been decorated with a specific Angular decorator.
 *
 * @internal
 *
 * ```ts
 * isNgType(MockModule, 'NgModule'); // returns true
 * isNgType(RealComponent, 'Component'); // returns true
 * isNgType(ArbitraryClass, 'Directive'); // returns false
 * ```
 */
export const isNgType = (declaration: AnyType<any>, type: string): boolean => {
  const declarations = collectDeclarations(declaration);

  return !!declarations[type];
};
