import helperMockService from '../mock-service/helper.mock-service';

import mockHelperConsole from './mock-helper.console';

const factory = (propName: string) => helperMockService.mockFunction(`console.${propName}`);

// Thanks Ivy, it does not throw an error, and we have to use injector.
export default mockHelperConsole(['log'], factory);
