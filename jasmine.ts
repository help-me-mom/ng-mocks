import { registerMockFunction } from 'ng-mocks';

declare const jasmine: any;

registerMockFunction(mockName => jasmine.createSpy(mockName));
