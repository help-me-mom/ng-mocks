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
export default (...methods: Array<keyof typeof console>): void => {
  const backup: Array<[keyof typeof console, any]> = [];

  beforeEach(() => {
    if (methods.indexOf('warn') === -1) {
      methods.push('warn');
    }
    if (methods.indexOf('error') === -1) {
      methods.push('error');
    }
    for (const method of methods) {
      backup.push([method, console[method]]);
      console[method] = factory(method) as never;
    }
  });

  afterEach(() => {
    for (const [method, implementation] of backup) {
      console[method] = implementation;
    }
    backup.splice(0, backup.length);
  });
};
