import { Mock } from '../common/mock';

/**
 * MockedModule is a legacy representation of an interface of a mock module instance.
 * Please avoid its usage, because, usually, you should not rely on whether it's a mock or not.
 */
export type MockedModule<T> = T & Mock;
