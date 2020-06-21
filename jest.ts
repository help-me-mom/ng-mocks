import { mockServiceHelper } from 'ng-mocks';

declare const jest: any;

mockServiceHelper.registerMockFunction(name => jest.fn().mockName(name));
