import { flatten } from '../common/core.helpers';
import funcGetType from '../common/func.get-type';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (providers?: any[]): void => {
  for (const provider of flatten(providers ?? [])) {
    const provide = funcGetType(provider);

    const config = ngMocksUniverse.configInstance.get(provide) ?? {};
    if (!config.exported) {
      config.exported = true;
    }
    ngMocksUniverse.configInstance.set(provide, config);
  }
};
