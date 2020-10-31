import { registerMockFunction } from 'ng-mocks';

registerMockFunction(name => jest.fn().mockName(name));
