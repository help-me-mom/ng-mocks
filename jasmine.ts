import { registerMockFunction } from 'ng-mocks';

/**
 * @deprecated will be removed in v12, use `ngMocks.autoSpy('jasmine')`.
 */
registerMockFunction(mockName => jasmine.createSpy(mockName));
