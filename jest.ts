import { mockServiceHelper } from './lib/mock-service';

declare const jest: any;

mockServiceHelper.registerMockFunction(() => jest.fn());
