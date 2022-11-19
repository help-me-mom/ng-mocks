import { NgModule } from '@angular/core';

import { Type } from './core.types';

/**
 * NgModuleWithProviders helps to support ModuleWithProviders in all angular versions.
 * In A5 it was without the generic type.
 *
 * @internal remove after removal of A5 support
 */
export interface NgModuleWithProviders<T = any> {
  ngModule: Type<T>;
  providers?: NgModule['providers'];
}

/**
 * isNgModuleDefWithProviders checks if an object implements ModuleWithProviders.
 *
 * @internal
 */
export const isNgModuleDefWithProviders = (declaration: any): declaration is NgModuleWithProviders =>
  declaration && typeof declaration === 'object' && typeof declaration.ngModule === 'function';
