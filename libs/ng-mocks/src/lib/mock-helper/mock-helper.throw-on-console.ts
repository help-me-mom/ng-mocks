// tslint:disable no-console

// Thanks Ivy, it does not throw an error and we have to use injector.
export default (): void => {
  let backupWarn: typeof console.warn;
  let backupError: typeof console.error;

  beforeAll(() => {
    backupWarn = console.warn;
    backupError = console.error;
    // istanbul ignore next
    console.error = console.warn = (...args: any[]) => {
      throw new Error(args.join(' '));
    };
  });

  afterAll(() => {
    console.error = backupError;
    console.warn = backupWarn;
  });
};
