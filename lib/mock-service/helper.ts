import createMockFromPrototype from './helper.create-mock-from-prototype';
import extractMethodsFromPrototype from './helper.extract-methods-from-prototype';
import extractPropertiesFromPrototype from './helper.extract-properties-from-prototype';
import extractPropertyDescriptor from './helper.extract-property-descriptor';
import mock from './helper.mock';
import mockFunction from './helper.mock-function';
import replaceWithMocks from './helper.replace-with-mocks';
import resolveProvider from './helper.resolve-provider';
import useFactory from './helper.use-factory';
import { CustomMockFunction } from './types';

/* istanbul ignore next */
const getGlobal = (): any => window || global;

// We need a single pointer to the object among all environments.
getGlobal().ngMocksMockServiceHelper = getGlobal().ngMocksMockServiceHelper || {
  mockFunction,

  registerMockFunction: (func: CustomMockFunction | undefined) => {
    getGlobal().ngMocksMockServiceHelper.mockFunction.customMockFunction = func;
  },

  createMockFromPrototype,
  extractMethodsFromPrototype,
  extractPropertiesFromPrototype,
  extractPropertyDescriptor,
  mock,
  replaceWithMocks,
  resolveProvider,
  useFactory,
};

/**
 * DO NOT USE this object outside of the library.
 * It can be changed any time without a notice.
 *
 * @internal
 */
export default getGlobal().ngMocksMockServiceHelper;

export const registerMockFunction: (func: CustomMockFunction | undefined) => void = getGlobal().ngMocksMockServiceHelper
  .registerMockFunction;
