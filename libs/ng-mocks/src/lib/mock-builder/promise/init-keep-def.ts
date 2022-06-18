import { mapValues } from '../../common/core.helpers';
import { funcExtractDeps } from '../../common/func.extract-deps';
import ngMocksUniverse from '../../common/ng-mocks-universe';

export default (keepDef: Set<any>, configDef: Map<any, any>): Set<any> => {
  const mockDef = new Set<any>();
  const builtDeclarations = ngMocksUniverse.builtDeclarations;
  const builtProviders = ngMocksUniverse.builtProviders;
  const resolutions = ngMocksUniverse.config.get('ngMocksDepsResolution');
  for (const def of mapValues(keepDef)) {
    builtDeclarations.set(def, def);
    builtProviders.set(def, def);
    resolutions.set(def, 'keep');

    const config = configDef.get(def);
    if (config.shallow) {
      funcExtractDeps(def, mockDef);
    }
  }

  return mockDef;
};
