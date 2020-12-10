import { Provider } from '@angular/core';
import { NG_ASYNC_VALIDATORS, NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { flatten } from '../common/core.helpers';
import { AnyType } from '../common/core.types';
import funcGetProvider from '../common/func.get-provider';
import {
  MockAsyncValidatorProxy,
  MockControlValueAccessorProxy,
  MockValidatorProxy,
} from '../common/mock-control-value-accessor-proxy';
import helperMockService from '../mock-service/helper.mock-service';

import toFactoryProvider from './to-factory-provider';

const processProvider = (provider: any, mockType: AnyType<any>, resolutions: Map<any, any>): any => {
  if (provider === NG_VALIDATORS) {
    return toFactoryProvider(provider, () => new MockValidatorProxy(mockType));
  }
  if (provider === NG_ASYNC_VALIDATORS) {
    return toFactoryProvider(provider, () => new MockAsyncValidatorProxy(mockType));
  }
  if (provider === NG_VALUE_ACCESSOR) {
    return toFactoryProvider(provider, () => new MockControlValueAccessorProxy(mockType));
  }

  return helperMockService.resolveProvider(provider, resolutions);
};

export default (
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
    const mock = processProvider(provide, mockType, resolutions);
    if (mock) {
      result.push(mock);
    }
  }

  return {
    providers: result,
    setControlValueAccessor,
  };
};
