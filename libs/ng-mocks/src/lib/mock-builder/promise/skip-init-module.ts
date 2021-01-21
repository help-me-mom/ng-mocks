import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import { BuilderData } from './types';

export default (def: any, configDef: BuilderData['configDef']): boolean => {
  if (isNgDef(def, 'i') || !isNgDef(def)) {
    return true;
  }
  if (ngMocksUniverse.touches.has(def)) {
    return true;
  }

  const config = configDef.get(def);

  return config && config.dependency;
};
