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

  return collectDeclarations(declaration)[type].standalone === true;
}
