import { Provider } from '@angular/core';

import { Type } from './core.types';
import { isNgDef } from './func.is-ng-def';

/**
 * NgModuleWithProviders helps to support ModuleWithProviders in all angular versions.
 * In A5 it was without the generic type.
 *
 * @internal remove after removal of A5 support
 */
export interface NgModuleWithProviders<T = any> {
  ngModule: Type<T>;
  providers?: Provider[];
}

/**
 * isNgModuleDefWithProviders checks if an object implements ModuleWithProviders.
 *
 * @internal
 */
export const isNgModuleDefWithProviders = (declaration: any): declaration is NgModuleWithProviders =>
  declaration &&
  typeof declaration === 'object' &&
  declaration.ngModule !== undefined &&
  isNgDef(declaration.ngModule, 'm');
