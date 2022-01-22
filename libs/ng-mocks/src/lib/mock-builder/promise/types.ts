// istanbul ignore file

import { InjectionToken, Provider } from '@angular/core';

import { Type } from '../../common/core.types';
import { NgModuleWithProviders } from '../../common/func.is-ng-module-def-with-providers';

export type BuilderData = {
  configDef: Map<Type<any> | InjectionToken<any> | string, any>;
  defProviders: Map<Type<any> | InjectionToken<any> | string, Provider[]>;
  defValue: Map<Type<any> | InjectionToken<any> | string, any>;
  excludeDef: Set<Type<any> | InjectionToken<any> | string>;
  keepDef: Set<Type<any> | InjectionToken<any> | string>;
  mockDef: Set<Type<any> | InjectionToken<any> | string>;
  providerDef: Map<Type<any> | InjectionToken<any> | string, Provider>;
  replaceDef: Set<Type<any> | InjectionToken<any> | string>;
};

export type NgMeta = {
  declarations: Array<Type<any>>;
  imports: Array<Type<any> | NgModuleWithProviders>;
  providers: Provider[];
};
