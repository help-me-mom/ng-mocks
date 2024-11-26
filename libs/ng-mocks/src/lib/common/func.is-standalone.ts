import { VERSION } from '@angular/core';

import collectDeclarations from '../resolve/collect-declarations';

import { getNgType } from './func.get-ng-type';

/**
 * Checks whether a class has been decorated with the standalone flag.
 */
export function isStandalone(declaration: any): boolean {
  const type = getNgType(declaration);
  if (!type || type === 'Injectable') {
    return false;
  }

  // Handle Angular 19+ default standalone behavior
  const declarations = collectDeclarations(declaration);
  if (Number(VERSION.major) >= 19 && type !== 'NgModule' && declarations[type].standalone === undefined) {
    return true;
  }

  return declarations[type].standalone === true;
}
