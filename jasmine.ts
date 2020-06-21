import { mockServiceHelper } from 'ng-mocks';

declare const jasmine: any;

mockServiceHelper.registerMockFunction(mockName => jasmine.createSpy(mockName));
