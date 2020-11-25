import { mapValues } from '../../common/core.helpers';
import { NG_MOCKS_ROOT_PROVIDERS } from '../../common/core.tokens';
import { isNgInjectionToken } from '../../common/func.is-ng-injection-token';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import helperMockService from '../../mock-service/helper.mock-service';

import getRootProviderParameters from './get-root-provider-parameters';
import { BuilderData, NgMeta } from './types';

// Mocking root providers.
export default (ngModule: NgMeta, { keepDef, mockDef }: BuilderData): void => {
  // Adding missed providers.
  const parameters = keepDef.has(NG_MOCKS_ROOT_PROVIDERS) ? new Set() : getRootProviderParameters(mockDef);
  if (parameters.size) {
    const parametersMap = new Map();
    for (const parameter of mapValues(parameters)) {
      const mock = helperMockService.resolveProvider(parameter, parametersMap);
      if (mock) {
        ngModule.providers.push(mock);
      } else if (isNgInjectionToken(parameter)) {
        const multi = ngMocksUniverse.config.has('multi') && ngMocksUniverse.config.get('multi').has(parameter);
        ngModule.providers.push(helperMockService.useFactory(parameter, () => (multi ? [] : undefined)));
      }
    }
  }
};
