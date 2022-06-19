import collectDeclarations from '../resolve/collect-declarations';

import { AnyType } from './core.types';

/**
 * Checks whether a class has been decorated with a specific Angular decorator.
 * Due to the extension / multi decoration, we rely on the last used decorator.
 *
 * @internal
 *
 * ```ts
 * isNgType(MockModule, 'NgModule'); // returns true
 * isNgType(RealComponent, 'Component'); // returns true
 * isNgType(ArbitraryClass, 'Directive'); // returns false
 * isNgType(ArbitraryClass, 'Injectable'); // returns false
 * ```
 */
export const isNgType = (declaration: AnyType<any>, type: string): boolean => {
  const { decorators } = collectDeclarations(declaration);
  if (decorators.length === 0) {
    return false;
  }

  let offset = 1;

  // Injectable works well if the declaration is in providers.
  if (type === 'Injectable' && decorators.indexOf('Injectable') !== -1) {
    return true;
  }

  // Skipping Injectable.
  while (decorators[decorators.length - offset] === 'Injectable') {
    offset += 1;
  }

  return decorators[decorators.length - offset] === type;
};
