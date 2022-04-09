import { mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (): {
  buckets: any[];
  touched: any[];
} => {
  // We need buckets here to process first all depsSkip, then deps and only after that all other defs.
  const buckets: any[] = [
    mapValues(ngMocksUniverse.config.get('ngMocksDepsSkip')),
    mapValues(ngMocksUniverse.config.get('ngMocksDeps')),
    mapValues(ngMocksUniverse.touches),
  ];

  // Also, we need to track what has been touched to check params recursively, but avoiding duplicates.
  const touched: any[] = [].concat(...buckets);

  return {
    buckets,
    touched,
  };
};
