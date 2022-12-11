import { Provider } from '@angular/core';

import CoreDefStack from '../common/core.def-stack';
import coreForm from '../common/core.form';
import { flatten } from '../common/core.helpers';
import { AnyType } from '../common/core.types';
import funcExtractForwardRef from '../common/func.extract-forward-ref';
import funcGetType from '../common/func.get-type';
import {
  MockAsyncValidatorProxy,
  MockControlValueAccessorProxy,
  MockValidatorProxy,
} from '../common/mock-control-value-accessor-proxy';
import helperMockService from '../mock-service/helper.mock-service';

import toExistingProvider from './to-existing-provider';
import toFactoryProvider from './to-factory-provider';

const processTokens = (mockType: AnyType<any>, provider: any) => {
  const provide = funcGetType(provider);
  if (coreForm.NG_VALIDATORS && provide === coreForm.NG_VALIDATORS) {
    return toFactoryProvider(provide, () => new MockValidatorProxy(mockType));
  }
  if (coreForm.NG_ASYNC_VALIDATORS && provide === coreForm.NG_ASYNC_VALIDATORS) {
    return toFactoryProvider(provide, () => new MockAsyncValidatorProxy(mockType));
  }
  if (coreForm.NG_VALUE_ACCESSOR && provide === coreForm.NG_VALUE_ACCESSOR) {
    return toFactoryProvider(provide, () => new MockControlValueAccessorProxy(mockType));
  }

  return undefined;
};

const processOwnUseExisting = (sourceType: AnyType<any>, mockType: AnyType<any>, provider: any) => {
  const provide = funcGetType(provider);

  // Check tests/issue-302/test.spec.ts
  if (provide === coreForm.NgControl || provide === coreForm.FormControlDirective) {
    return undefined;
  }

  if (provider !== provide && funcExtractForwardRef(provider.useExisting) === sourceType) {
    return toExistingProvider(provide, mockType);
  }

  return undefined;
};

const processProvider = (
  sourceType: AnyType<any>,
  mockType: AnyType<any>,
  provider: any,
  resolutions: CoreDefStack<any, any>,
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
  providers: any[],
  resolutions: CoreDefStack<any, any>,
): {
  providers: Provider[];
  setControlValueAccessor?: boolean;
} => {
  const result: Provider[] = [];
  let setControlValueAccessor: boolean | undefined;

  for (const provider of flatten(providers || /* istanbul ignore next */ [])) {
    const provide = funcGetType(provider);
    if (provide === coreForm.NG_VALUE_ACCESSOR) {
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
