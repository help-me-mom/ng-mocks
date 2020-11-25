import { extractDependency, flatten, mapValues } from '../../common/core.helpers';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import { BuilderData, NgMeta } from './types';

export default (ngModule: NgMeta, { providerDef }: BuilderData): void => {
  // Adding requested providers to test bed.
  for (const provider of mapValues(providerDef)) {
    ngModule.providers.push(provider);
  }

  // Analyzing providers.
  for (const provider of flatten(ngModule.providers)) {
    const provide = typeof provider === 'object' && (provider as any).provide ? (provider as any).provide : provider;
    ngMocksUniverse.touches.add(provide);

    if (provide !== provider && (provider as any).deps) {
      extractDependency((provider as any).deps, ngMocksUniverse.config.get('deps'));
    }
  }
};
