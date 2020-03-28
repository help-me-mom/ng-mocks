import { mockServiceHelper } from './lib/mock-service';

declare const jasmine: any;

mockServiceHelper.registerMockFunction(mockName => jasmine.createSpy(mockName));
