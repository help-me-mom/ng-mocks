import coreReflectParametersResolve from '../../common/core.reflect.parameters-resolve';
import { NG_MOCKS_ROOT_PROVIDERS } from '../../common/core.tokens';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import addDefToRootProviderParameters from './add-def-to-root-provider-parameters';
import checkRootProviderDependency from './check-root-provider-dependency';
import extractDep from './extract-dep';
import getRootProvidersData from './get-root-providers-data';
import handleProvidedInDependency from './handle-provided-in-dependency';
import skipRootProviderDependency from './skip-root-provider-dependency';
import { BuilderData } from './types';

export default (mockDef: BuilderData['mockDef']): Set<any> => {
  const parameters = new Set();
  const { buckets, touched } = getRootProvidersData();

  for (const bucket of buckets) {
    for (const def of bucket) {
      addDefToRootProviderParameters(parameters, mockDef, def);

      for (const decorators of coreReflectParametersResolve(def)) {
        const provide: any = extractDep(decorators);
        handleProvidedInDependency(provide);
        if (skipRootProviderDependency(provide)) {
          continue;
        }
        checkRootProviderDependency(provide, touched, bucket);
        if (mockDef.has(NG_MOCKS_ROOT_PROVIDERS) || !ngMocksUniverse.config.get('ngMocksDepsSkip').has(def)) {
          parameters.add(provide);
        } else {
          ngMocksUniverse.config.get('ngMocksDepsSkip').add(provide);
        }
      }
    }
  }

  return parameters;
};
