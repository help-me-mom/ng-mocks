import helperCreateMockFromPrototype from './helper.create-mock-from-prototype';
import helperExtractMethodsFromPrototype from './helper.extract-methods-from-prototype';
import helperExtractPropertiesFromPrototype from './helper.extract-properties-from-prototype';
import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';
import helperMock from './helper.mock';
import helperMockFunction from './helper.mock-function';
import helperReplaceWithMocks from './helper.replace-with-mocks';
import helperResolveProvider from './helper.resolve-provider';
import helperUseFactory from './helper.use-factory';
import { CustomMockFunction } from './types';

// istanbul ignore next
const getGlobal = (): any => window || global;

// We need a single pointer to the object among all environments.
getGlobal().ngMockshelperMockService = getGlobal().ngMockshelperMockService || {
  mockFunction: helperMockFunction,

  registerMockFunction: (func: CustomMockFunction | undefined) => {
    getGlobal().ngMockshelperMockService.mockFunction.customMockFunction = func;
  },

  createMockFromPrototype: helperCreateMockFromPrototype,
  extractMethodsFromPrototype: helperExtractMethodsFromPrototype,
  extractPropertiesFromPrototype: helperExtractPropertiesFromPrototype,
  extractPropertyDescriptor: helperExtractPropertyDescriptor,
  mock: helperMock,
  replaceWithMocks: helperReplaceWithMocks,
  resolveProvider: helperResolveProvider,
  useFactory: helperUseFactory,
};

export default (() => getGlobal().ngMockshelperMockService)();

export const registerMockFunction: (func: CustomMockFunction | undefined) => void = getGlobal().ngMockshelperMockService
  .registerMockFunction;
