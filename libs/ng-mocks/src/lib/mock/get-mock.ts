import { extendClass } from '../common/core.helpers';
import funcImportExists from '../common/func.import-exists';
import { isMockNgDef } from '../common/func.is-mock-ng-def';
import ngMocksUniverse from '../common/ng-mocks-universe';

import returnCachedMock from './return-cached-mock';

export default (def: any, type: any, func: string, cacheFlag: string, base: any, decorator: any) => {
  funcImportExists(def, func);

  if (isMockNgDef(def, type)) {
    return def;
  }

  if (ngMocksUniverse.flags.has(cacheFlag) && ngMocksUniverse.cacheDeclarations.has(def)) {
    return returnCachedMock(def);
  }

  const hasNgMocksDepsResolution = ngMocksUniverse.config.has('ngMocksDepsResolution');
  if (!hasNgMocksDepsResolution) {
    ngMocksUniverse.config.set('ngMocksDepsResolution', new Map());
  }

  const mock = extendClass(base);
  decorator(def, mock);

  // istanbul ignore else
  if (ngMocksUniverse.flags.has(cacheFlag)) {
    ngMocksUniverse.cacheDeclarations.set(def, mock);
  }

  if (!hasNgMocksDepsResolution) {
    ngMocksUniverse.config.delete('ngMocksDepsResolution');
  }

  return mock as any;
};
