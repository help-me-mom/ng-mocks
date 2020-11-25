import ngMocksUniverse from '../../common/ng-mocks-universe';

import { BuilderData } from './types';

export default (
  replaceDef: BuilderData['replaceDef'],
  defValue: BuilderData['defValue'],
  source: any,
  value: any,
): boolean => {
  // no reason to touch mocks
  if (ngMocksUniverse.cacheDeclarations.has(value)) {
    return true;
  }

  // no customizations in replacements
  if (replaceDef.has(source) && value === defValue.get(source)) {
    return true;
  }

  return false;
};
