import { mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (): {
  buckets: any[];
} => {
  // We need buckets here to process first all depsSkip, then deps and only after that all other defs.
  const buckets: any[] = [
    mapValues(ngMocksUniverse.config.get('ngMocksDepsSkip')),
    mapValues(ngMocksUniverse.config.get('ngMocksDeps')),
    mapValues(ngMocksUniverse.touches),
  ];

  return {
    buckets,
  };
};
