import { getNgType } from './func.get-ng-type';

/**
 * Checks whether a class has been decorated with the standalone flag.
 */
export function isStandalone(declaration: any): boolean {
  const type = getNgType(declaration);
  if (!type || type === 'Injectable' || type === 'NgModule') {
    return false;
  }
  // here we don't use the angular/core isStandalone for backward compatibility
  // once backward compatibility allows that, following lines can be replaced:
  // import { isStandalone as isStandaloneAngular } from '@angular/core';
  // return isStandalone(declaration);
  const def = declaration.ɵcmp || declaration.ɵdir || declaration.ɵpipe;
  return def?.standalone;
}
