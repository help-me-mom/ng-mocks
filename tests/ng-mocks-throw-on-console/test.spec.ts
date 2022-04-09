import { ngMocks } from 'ng-mocks';

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('ng-mocks-throw-on-console', () => {
  ngMocks.throwOnConsole();

  it('throws on warn', () => {
    try {
      console.warn('warn message');
      fail('should have failed');
    } catch (error) {
      expect(error).toEqual(
        assertion.objectContaining({
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
    } catch (error) {
      expect(error).toEqual(
        assertion.objectContaining({
          message: 'error message',
          ngMocksConsoleCatch: 'error',
        }),
      );
    }
  });
});
