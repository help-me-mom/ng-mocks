import { isNgDef } from '../../common/func.is-ng-def';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (def: any, configDef: Map<any, any>): boolean => {
  if (!isNgDef(def, 'i') && isNgDef(def)) {
    return true;
  }

  const config = configDef.get(def);
  if (config?.dependency) {
    return true;
  }

  const configInstance = ngMocksUniverse.configInstance.get(def);
  if (ngMocksUniverse.touches.has(def) && (configInstance?.exported || !config?.export)) {
    return true;
  }

  return false;
};
