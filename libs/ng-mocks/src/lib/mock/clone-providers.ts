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

const processProvider = (provider: any, mockType: AnyType<any>, resolutions: Map<any, any>): any => {
  if (NG_VALIDATORS && provider === NG_VALIDATORS) {
    return toFactoryProvider(provider, () => new MockValidatorProxy(mockType));
  }
  if (NG_ASYNC_VALIDATORS && provider === NG_ASYNC_VALIDATORS) {
    return toFactoryProvider(provider, () => new MockAsyncValidatorProxy(mockType));
  }
  if (NG_VALUE_ACCESSOR && provider === NG_VALUE_ACCESSOR) {
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
