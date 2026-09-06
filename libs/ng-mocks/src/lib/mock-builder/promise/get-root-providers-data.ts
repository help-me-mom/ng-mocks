import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (): {
  buckets: any[];
} => {
  // We need buckets here to process first all depsSkip, then deps and only after that all other defs.
  const buckets: any[] = [
    [...ngMocksUniverse.config.get('ngMocksDepsSkip')],
    [...ngMocksUniverse.config.get('ngMocksDeps')],
    [...ngMocksUniverse.touches],
  ];

  return {
    buckets,
  };
};
