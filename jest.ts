import { mockServiceHelper } from 'ng-mocks';

mockServiceHelper.registerMockFunction(name => jest.fn().mockName(name));
