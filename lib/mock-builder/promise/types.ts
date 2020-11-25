import { InjectionToken, Provider } from '@angular/core';
import { NgModuleWithProviders, Type } from 'ng-mocks';

export type BuilderData = {
  configDef: Map<Type<any> | InjectionToken<any>, any>;
  defProviders: Map<Type<any> | InjectionToken<any>, Provider[]>;
  defValue: Map<Type<any> | InjectionToken<any>, any>;
  excludeDef: Set<Type<any> | InjectionToken<any>>;
  keepDef: Set<Type<any> | InjectionToken<any>>;
  mockDef: Set<Type<any> | InjectionToken<any>>;
  providerDef: Map<Type<any> | InjectionToken<any>, Provider>;
  replaceDef: Set<Type<any> | InjectionToken<any>>;
};

export type NgMeta = {
  declarations: Array<Type<any>>;
  imports: Array<Type<any> | NgModuleWithProviders>;
  providers: Provider[];
};
