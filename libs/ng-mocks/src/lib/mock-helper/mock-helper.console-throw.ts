import coreDefineProperty from '../common/core.define-property';

import mockHelperConsole from './mock-helper.console';

const factory =
  (propName: string) =>
  (...args: any[]) => {
    const error = new Error(args.join(' '));
    coreDefineProperty(error, 'ngMocksConsoleCatch', propName);
    throw error;
  };

// Thanks Ivy, it does not throw an error, and we have to use injector.
export default mockHelperConsole(['warn', 'error'], factory);
