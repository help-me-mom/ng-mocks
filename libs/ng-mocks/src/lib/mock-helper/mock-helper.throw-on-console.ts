// tslint:disable no-console

import coreDefineProperty from '../common/core.define-property';

const factory =
  (propName: string) =>
  (...args: any[]) => {
    const error = new Error(args.join(' '));
    coreDefineProperty(error, 'ngMocksConsoleCatch', propName, false);
    throw error;
  };

// Thanks Ivy, it does not throw an error and we have to use injector.
export default (): void => {
  let backupWarn: typeof console.warn;
  let backupError: typeof console.error;

  beforeAll(() => {
    backupWarn = console.warn;
    backupError = console.error;
    // istanbul ignore next
    console.warn = factory('warn');
    console.error = factory('error');
  });

  afterAll(() => {
    console.error = backupError;
    console.warn = backupWarn;
  });
};
