import { ModuleWithProviders } from '@angular/core';

import { Type } from '../../common/core.types';
import ngMocksUniverse from '../../common/ng-mocks-universe';

import { BuilderData } from './types';

export default (def: Type<any>, defProviders: BuilderData['defProviders']): Type<any> | ModuleWithProviders<any> => {
  const loModule = ngMocksUniverse.config.get('mockNgDefResolver').get(def) ?? ngMocksUniverse.getBuildDeclaration(def);
  const loProviders = defProviders.has(def) ? defProviders.get(def) : undefined;

  return loProviders
    ? {
        ngModule: loModule,
        providers: loProviders,
      }
    : loModule;
};
