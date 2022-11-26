import ngMocksUniverse from '../common/ng-mocks-universe';

export default (declaration: any) => {
  const result = ngMocksUniverse.cacheDeclarations.get(declaration);
  if (declaration.__ngMocksResolutions && ngMocksUniverse.config.has('mockNgDefResolver')) {
    ngMocksUniverse.config.get('mockNgDefResolver').merge(declaration.__ngMocksResolutions);
  }

  return result;
};
