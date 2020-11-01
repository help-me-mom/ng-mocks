import { Provider } from '@angular/core';

import { Type } from './core.types';
import { isNgDef } from './func.is-ng-def';

// remove after removal of A5 support
// tslint:disable-next-line:interface-name
export interface NgModuleWithProviders<T = any> {
  ngModule: Type<T>;
  providers?: Provider[];
}

// Checks if an object implements ModuleWithProviders.
export const isNgModuleDefWithProviders = (declaration: any): declaration is NgModuleWithProviders =>
  declaration.ngModule !== undefined && isNgDef(declaration.ngModule, 'm');
