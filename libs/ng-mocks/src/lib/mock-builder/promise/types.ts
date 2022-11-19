// istanbul ignore file

import { InjectionToken, NgModule, Provider } from '@angular/core';

import { Type } from '../../common/core.types';
import { NgModuleWithProviders } from '../../common/func.is-ng-module-def-with-providers';
import { IMockBuilderConfigAll } from '../types';

export type BuilderData = {
  configDef: Map<Type<any> | InjectionToken<any> | string, any>;
  configDefault: IMockBuilderConfigAll;
  defProviders: Map<Type<any> | InjectionToken<any> | string, NgModule['providers']>;
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
