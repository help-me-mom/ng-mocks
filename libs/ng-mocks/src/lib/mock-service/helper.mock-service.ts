import funcGetGlobal from '../common/func.get-global';

import helperCreateClone from './helper.create-clone';
import helperCreateMockFromPrototype from './helper.create-mock-from-prototype';
import helperDefinePropertyDescriptor from './helper.define-property-descriptor';
import helperExtractMethodsFromPrototype from './helper.extract-methods-from-prototype';
import helperExtractPropertiesFromPrototype from './helper.extract-properties-from-prototype';
import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';
import helperMock from './helper.mock';
import helperMockFunction from './helper.mock-function';
import helperReplaceWithMocks from './helper.replace-with-mocks';
import helperResolveProvider from './helper.resolve-provider';
import helperUseFactory from './helper.use-factory';
import { CustomMockFunction } from './types';

// We need a single pointer to the object among all environments.
funcGetGlobal().ngMockshelperMockService = funcGetGlobal().ngMockshelperMockService || {
  mockFunction: helperMockFunction,

  registerMockFunction: (func: CustomMockFunction | undefined) => {
    funcGetGlobal().ngMockshelperMockService.mockFunction.customMockFunction = func;
  },

  createClone: helperCreateClone,
  createMockFromPrototype: helperCreateMockFromPrototype,
  definePropertyDescriptor: helperDefinePropertyDescriptor,
  extractMethodsFromPrototype: helperExtractMethodsFromPrototype,
  extractPropertiesFromPrototype: helperExtractPropertiesFromPrototype,
  extractPropertyDescriptor: helperExtractPropertyDescriptor,
  mock: helperMock,
  replaceWithMocks: helperReplaceWithMocks,
  resolveProvider: helperResolveProvider,
  useFactory: helperUseFactory,
};

export default ((): {
  createClone: typeof helperCreateClone;
  createMockFromPrototype: typeof helperCreateMockFromPrototype;
  definePropertyDescriptor: typeof helperDefinePropertyDescriptor;
  extractMethodsFromPrototype: typeof helperExtractMethodsFromPrototype;
  extractPropertiesFromPrototype: typeof helperExtractPropertiesFromPrototype;
  extractPropertyDescriptor: typeof helperExtractPropertyDescriptor;
  mock: typeof helperMock;
  mockFunction: typeof helperMockFunction;
  registerMockFunction: (func: CustomMockFunction | undefined) => void;
  replaceWithMocks: typeof helperReplaceWithMocks;
  resolveProvider: typeof helperResolveProvider;
  useFactory: typeof helperUseFactory;
} => funcGetGlobal().ngMockshelperMockService)();

export function registerMockFunction(func?: CustomMockFunction | undefined): void {
  funcGetGlobal().ngMockshelperMockService.registerMockFunction(func);
}
