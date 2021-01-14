import ngMocksUniverse from '../common/ng-mocks-universe';

export default () => {
  ngMocksUniverse.cacheDeclarations.clear();
  ngMocksUniverse.config.get('ngMocksDepsSkip')?.clear();
};
