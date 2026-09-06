import { funcExtractDeps } from '../../common/func.extract-deps';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import checkIsClass from '../../mock-service/check.is-class';

import getRootProviderKeepProvider from './get-root-provider-keep-provider';

export default (keepDef: Set<any>, configDef: Map<any, any>): Set<any> => {
  const dependencies = new Set<any>();
  const builtDeclarations = ngMocksUniverse.builtDeclarations;
  const builtProviders = ngMocksUniverse.builtProviders;
  const resolutions = ngMocksUniverse.config.get('ngMocksDepsResolution');
  // eslint-disable-next-line unicorn/no-useless-spread -- A user config's shallow getter can change kept definitions.
  for (const def of [...keepDef]) {
    const provider = getRootProviderKeepProvider(def);
    builtDeclarations.set(def, def);
    // Functional router callbacks are definitions, but they are not class
    // providers. Keeping one must not make Angular construct it through DI.
    if (provider || typeof def !== 'function' || checkIsClass(def)) {
      builtProviders.set(def, provider ?? def);
    }
    resolutions.set(def, 'keep');

    const config = configDef.get(def);
    if (config.shallow) {
      funcExtractDeps(def, dependencies);
    }
  }

  return dependencies;
};
