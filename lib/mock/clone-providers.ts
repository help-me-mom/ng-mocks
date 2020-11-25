import { Provider } from '@angular/core';
import { NG_VALIDATORS, NG_VALUE_ACCESSOR } from '@angular/forms';

import { flatten } from '../common/core.helpers';
import { AnyType } from '../common/core.types';
import helperMockService from '../mock-service/helper.mock-service';

import toExistingProvider from './to-existing-provider';

export default (mockType: AnyType<any>, providers?: any[]): { providers: Provider[]; setNgValueAccessor?: boolean } => {
  const result: Provider[] = [];
  let setNgValueAccessor: boolean | undefined;
  const resolutions = new Map();

  for (const provider of flatten(providers || /* istanbul ignore next */ [])) {
    const provide = provider && typeof provider === 'object' && provider.provide ? provider.provide : provider;
    if (provide === NG_VALIDATORS) {
      result.push(toExistingProvider(provide, mockType, true));
    } else if (setNgValueAccessor === undefined && provide === NG_VALUE_ACCESSOR) {
      setNgValueAccessor = false;
      result.push(toExistingProvider(provide, mockType, true));
    } else {
      const mock = helperMockService.resolveProvider(provider, resolutions);
      if (mock) {
        result.push(mock);
      }
    }
  }

  return {
    providers: result,
    setNgValueAccessor,
  };
};
