import { flatten } from '../common/core.helpers';
import funcGetProvider from '../common/func.get-provider';
import ngMocksUniverse from '../common/ng-mocks-universe';

export default (providers?: any[]): void => {
  for (const provider of flatten(providers ?? [])) {
    const provide = funcGetProvider(provider);

    const config = ngMocksUniverse.configInstance.get(provide) ?? {};
    config.exported = true;
    ngMocksUniverse.configInstance.set(provide, config);
  }
};
