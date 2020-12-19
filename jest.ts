import { registerMockFunction } from 'ng-mocks';

/**
 * @deprecated will be removed in v12, use `ngMocks.autoSpy('jest')`.
 */
registerMockFunction(name => jest.fn().mockName(name));
