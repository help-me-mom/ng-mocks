import { mockServiceHelper } from './lib/mock-service';

declare const jest: any;

mockServiceHelper.registerMockFunction(name => jest.fn().mockName(name));
