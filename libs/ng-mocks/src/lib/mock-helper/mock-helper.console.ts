/* eslint-disable no-console */

import coreDefineProperty from '../common/core.define-property';

// Thanks Ivy, it does not throw an error, and we have to use injector.
export default (defaultMethods: Array<keyof typeof console>, factory: (name: string) => any) =>
  (...methods: Array<keyof typeof console>): void => {
    const backup: Array<keyof typeof console> = [];

    beforeEach(() => {
      for (const method of defaultMethods) {
        if (methods.indexOf(method) === -1) {
          methods.push(method);
        }
      }

      for (const method of methods) {
        coreDefineProperty(console, `__ngMocksBackup_${method}`, (console as any)[`__ngMocksBackup_${method}`] || []);
        (console as any)[`__ngMocksBackup_${method}`].push(console[method]);
        backup.push(method);
        // Node 26 marks console.Console readonly; hooks intentionally replace console members.
        const consoleMembers: Record<keyof typeof console, unknown> = console;
        consoleMembers[method] = factory(method);
      }
    });

    afterEach(() => {
      for (const method of backup) {
        const consoleMembers: Record<keyof typeof console, unknown> = console;
        consoleMembers[method] = (console as any)[`__ngMocksBackup_${method}`].pop();
      }
      backup.splice(0);
    });
  };
