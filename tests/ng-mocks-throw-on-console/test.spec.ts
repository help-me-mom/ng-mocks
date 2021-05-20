// tslint:disable no-console

import { ngMocks } from 'ng-mocks';

describe('ng-mocks-throw-on-console', () => {
  ngMocks.throwOnConsole();

  it('throws on warn', () => {
    try {
      console.warn('warn message');
      fail('should have failed');
    } catch (e) {
      expect(e).toEqual(
        jasmine.objectContaining({
          message: 'warn message',
          ngMocksConsoleCatch: 'warn',
        }),
      );
    }
  });

  it('throws on error', () => {
    try {
      console.error('error message');
      fail('should have failed');
    } catch (e) {
      expect(e).toEqual(
        jasmine.objectContaining({
          message: 'error message',
          ngMocksConsoleCatch: 'error',
        }),
      );
    }
  });
});
