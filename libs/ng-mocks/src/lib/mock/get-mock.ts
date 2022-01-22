import { extendClass } from '../common/core.helpers';
import funcImportExists from '../common/func.import-exists';
import { isMockNgDef } from '../common/func.is-mock-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (def: any, type: any, func: string, cacheFlag: string, base: any, decorator: any) => {
  funcImportExists(def, func);

  if (isMockNgDef(def, type)) {
    return def;
  }

  if (ngMocksUniverse.flags.has(cacheFlag) && ngMocksUniverse.cacheDeclarations.has(def)) {
    return ngMocksUniverse.cacheDeclarations.get(def);
  }

  const mock = extendClass(base);
  decorator(def, mock);

  // istanbul ignore else
  if (ngMocksUniverse.flags.has(cacheFlag)) {
    ngMocksUniverse.cacheDeclarations.set(def, mock);
  }

  return mock as any;
};
