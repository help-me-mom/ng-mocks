import { isStandalone as isStandaloneAngular } from '@angular/core';

import { getNgType } from './func.get-ng-type';

/**
 * Checks whether a class has been decorated with the standalone flag.
 */
export function isStandalone(declaration: any): boolean {
  const type = getNgType(declaration);
  if (!type || type === 'Injectable' || type === 'NgModule') {
    return false;
  }
  return isStandaloneAngular(declaration);
}
