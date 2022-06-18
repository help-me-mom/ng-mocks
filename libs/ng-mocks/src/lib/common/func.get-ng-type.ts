import collectDeclarations from '../resolve/collect-declarations';

import { AnyDeclaration } from './core.types';
import { isNgInjectionToken } from './func.is-ng-injection-token';
import { NgModuleWithProviders } from './func.is-ng-module-def-with-providers';

/**
 * Returns how the class has been decorated.
 * It doesn't work well, because multi decorations and extensions of decorated classes can bring strange behavior.
 * Because of that, we simply take the last decoration as the expected, if the decorator is not Injectable.
 * Services have the lowest priority.
 *
 * @internal
 *
 * ```ts
 * getNgType(MockModule); // returns 'NgModule' | 'Component' | 'Directive' | 'Pipe' | 'Injectable'
 * ```
 */
export const getNgType = (
  declaration: AnyDeclaration<any> | NgModuleWithProviders<any>,
): 'NgModule' | 'Component' | 'Directive' | 'Pipe' | 'Injectable' | undefined => {
  if (typeof declaration === 'string') {
    return undefined;
  }
  if (isNgInjectionToken(declaration)) {
    return 'Injectable';
  }

  const { decorators } = collectDeclarations(declaration);

  for (let index = decorators.length - 1; index >= 0; index -= 1) {
    if (decorators[index] === 'Injectable') {
      continue;
    }

    return decorators[index];
  }

  if (decorators.length > 0) {
    return 'Injectable';
  }

  return undefined;
};
