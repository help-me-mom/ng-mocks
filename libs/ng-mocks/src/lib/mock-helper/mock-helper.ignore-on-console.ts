// tslint:disable no-console

import helperMockService from '../mock-service/helper.mock-service';

const factory = (propName: string) => helperMockService.mockFunction(`console.${propName}`);

// Thanks Ivy, it does not throw an error and we have to use injector.
export default (...methods: Array<keyof typeof console>): void => {
  const backup: Array<[keyof typeof console, any]> = [];

  beforeEach(() => {
    if (methods.indexOf('log') === -1) {
      methods.push('log');
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
