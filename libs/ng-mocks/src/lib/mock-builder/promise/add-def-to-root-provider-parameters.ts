import { NG_MOCKS_ROOT_PROVIDERS } from '../../common/core.tokens';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import skipDep from './skip-dep';
import { BuilderData } from './types';

export default (parameters: Set<any>, mockDef: BuilderData['mockDef'], def: any): void => {
  if (
    !skipDep(def) &&
    (mockDef.has(NG_MOCKS_ROOT_PROVIDERS) || !ngMocksUniverse.config.get('ngMocksDepsSkip').has(def))
  ) {
    parameters.add(def);
  }
};
