import { InjectionToken, Provider } from '@angular/core';

import { flatten } from '../common/core.helpers';
import { AnyType } from '../common/core.types';
import funcGetProvider from '../common/func.get-provider';
import {
  MockAsyncValidatorProxy,
  MockControlValueAccessorProxy,
  MockValidatorProxy,
} from '../common/mock-control-value-accessor-proxy';
import helperMockService from '../mock-service/helper.mock-service';

import toExistingProvider from './to-existing-provider';
import toFactoryProvider from './to-factory-provider';

// tslint:disable variable-name
let NG_ASYNC_VALIDATORS: InjectionToken<any> | undefined;
let NG_VALIDATORS: InjectionToken<any> | undefined;
let NG_VALUE_ACCESSOR: InjectionToken<any> | undefined;
// tslint:enable variable-name
try {
  // tslint:disable-next-line no-require-imports no-var-requires
  const module = require('@angular/forms');
  // istanbul ignore else
  if (module) {
    NG_ASYNC_VALIDATORS = module.NG_ASYNC_VALIDATORS;
    NG_VALIDATORS = module.NG_VALIDATORS;
    NG_VALUE_ACCESSOR = module.NG_VALUE_ACCESSOR;
  }
} catch (e) {
  // nothing to do;
}

const processTokens = (mockType: AnyType<any>, provider: any) => {
  const provide = funcGetProvider(provider);
  if (NG_VALIDATORS && provide === NG_VALIDATORS) {
    return toFactoryProvider(provide, () => new MockValidatorProxy(mockType));
  }
  if (NG_ASYNC_VALIDATORS && provide === NG_ASYNC_VALIDATORS) {
    return toFactoryProvider(provide, () => new MockAsyncValidatorProxy(mockType));
  }
  if (NG_VALUE_ACCESSOR && provide === NG_VALUE_ACCESSOR) {
    return toFactoryProvider(provide, () => new MockControlValueAccessorProxy(mockType));
  }

  return undefined;
};

const processOwnUseExisting = (sourceType: AnyType<any>, mockType: AnyType<any>, provider: any) => {
  const provide = funcGetProvider(provider);
  if (provider !== provide && provider.useExisting === sourceType) {
    return toExistingProvider(provide, mockType);
  }
  if (
    provider !== provide &&
    provider.useExisting &&
    provider.useExisting.__forward_ref__ &&
    provider.useExisting() === sourceType
  ) {
    return toExistingProvider(provider, mockType);
  }

  return undefined;
};

const processProvider = (
  sourceType: AnyType<any>,
  mockType: AnyType<any>,
  provider: any,
  resolutions: Map<any, any>,
): any => {
  const token = processTokens(mockType, provider);
  if (token) {
    return token;
  }

  const ownUseExisting = processOwnUseExisting(sourceType, mockType, provider);
  if (ownUseExisting) {
    return ownUseExisting;
  }

  return helperMockService.resolveProvider(provider, resolutions);
};

export default (
  sourceType: AnyType<any>,
  mockType: AnyType<any>,
  providers?: any[],
): {
  providers: Provider[];
  setControlValueAccessor?: boolean;
} => {
  const result: Provider[] = [];
  let setControlValueAccessor: boolean | undefined;
  const resolutions = new Map();

  for (const provider of flatten(providers || /* istanbul ignore next */ [])) {
    const provide = funcGetProvider(provider);
    if (provide === NG_VALUE_ACCESSOR) {
      setControlValueAccessor = false;
    }
    const mock = processProvider(sourceType, mockType, provider, resolutions);
    if (mock) {
      result.push(mock);
    }
  }

  return {
    providers: result,
    setControlValueAccessor,
  };
};
