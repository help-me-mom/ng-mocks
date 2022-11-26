import CoreDefStack from '../../common/core.def-stack';
import { extractDependency, flatten, mapValues } from '../../common/core.helpers';
import coreReflectProvidedIn from '../../common/core.reflect.provided-in';
import funcGetProvider from '../../common/func.get-provider';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import helperResolveProvider from '../../mock-service/helper.resolve-provider';

import { BuilderData, NgMeta } from './types';

export default (ngModule: NgMeta, { providerDef, mockDef }: BuilderData, resolutions: CoreDefStack<any, any>): void => {
  // Adding requested providers to test bed.
  for (const provider of mapValues(providerDef)) {
    ngModule.providers.push(provider);
  }

  // Analyzing providers.
  for (const provider of flatten(ngModule.providers)) {
    const provide = funcGetProvider(provider);
    ngMocksUniverse.touches.add(provide);

    if (provide !== provider && (provider as any).deps) {
      extractDependency((provider as any).deps, ngMocksUniverse.config.get('ngMocksDeps'));
    }
  }

  for (const def of mapValues(mockDef)) {
    if (ngMocksUniverse.touches.has(def) || coreReflectProvidedIn(def) !== 'root') {
      continue;
    }

    ngModule.providers.push(helperResolveProvider(def, resolutions));
    ngMocksUniverse.touches.add(def);
  }
};
