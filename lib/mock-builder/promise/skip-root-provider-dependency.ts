import ngMocksUniverse from '../../common/ng-mocks-universe';

import skipDep from './skip-dep';

export default (provide: any): boolean => {
  if (skipDep(provide)) {
    return true;
  }

  return ngMocksUniverse.config.get('ngMocksDepsSkip').has(provide);
};
