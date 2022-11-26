import CoreDefStack from '../../common/core.def-stack';
import { mapValues } from '../../common/core.helpers';
import { NG_MOCKS_ROOT_PROVIDERS } from '../../common/core.tokens';
import { isNgInjectionToken } from '../../common/func.is-ng-injection-token';
import ngMocksUniverse from '../../common/ng-mocks-universe';
import helperResolveProvider from '../../mock-service/helper.resolve-provider';
import helperUseFactory from '../../mock-service/helper.use-factory';

import getRootProviderParameters from './get-root-provider-parameters';
import { BuilderData, NgMeta } from './types';

// Mocking root providers.
export default (ngModule: NgMeta, { keepDef, mockDef }: BuilderData, resolutions: CoreDefStack<any, any>): void => {
  // Adding missed providers.
  const parameters = keepDef.has(NG_MOCKS_ROOT_PROVIDERS) ? new Set() : getRootProviderParameters(mockDef);
  if (parameters.size > 0) {
    for (const parameter of mapValues(parameters)) {
      const mock = helperResolveProvider(parameter, resolutions);
      if (mock) {
        ngModule.providers.push(mock);
      } else if (isNgInjectionToken(parameter)) {
        const multi =
          ngMocksUniverse.config.has('ngMocksMulti') && ngMocksUniverse.config.get('ngMocksMulti').has(parameter);
        ngModule.providers.push(helperUseFactory(parameter, () => (multi ? [] : undefined)));
      }
    }
  }
};
