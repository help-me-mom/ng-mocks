// istanbul ignore file

import { Mock } from '../common/mock';

/**
 * MockedPipe is a legacy representation of an interface of a mock pipe instance.
 * Please avoid its usage, because, usually, you should not rely on whether it's a mock or not.
 */
export type MockedPipe<T> = T & Mock;
