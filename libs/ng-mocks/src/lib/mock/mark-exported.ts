import { getSourceOfMock } from '../common/func.get-source-of-mock';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (instanceDef: any, ngModuleDef?: any) => {
  const instance = getSourceOfMock(instanceDef);
  const configInstance = ngMocksUniverse.configInstance.get(instance) ?? { __set: true };
  if (!configInstance.exported) {
    configInstance.exported = new Set();
  }
  if (ngModuleDef) {
    configInstance.exported.add(getSourceOfMock(ngModuleDef));
  }
  if (configInstance.__set) {
    configInstance.__set = undefined;
    ngMocksUniverse.configInstance.set(instance, configInstance);
  }
};
