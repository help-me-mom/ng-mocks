// tslint:disable no-console

import { ngMocks } from 'ng-mocks';

describe('ng-mocks-ignore-on-console', () => {
  describe('default', () => {
    let original: any;
    beforeAll(() => (original = console.log));

    describe('override', () => {
      ngMocks.ignoreOnConsole();

      it('replaces the log with a spy', () => {
        expect(console.log).not.toBe(original);
        console.log('test');
        expect(console.log).toHaveBeenCalledWith('test');
      });
    });

    it('restores the original console.log', () => {
      expect(console.log).toBe(original);
    });
  });

  describe('custom', () => {
    let original: any;
    beforeAll(() => (original = console.warn));

    describe('override', () => {
      ngMocks.ignoreOnConsole('warn');

      it('replaces the log with a spy', () => {
        expect(console.warn).not.toBe(original);
        console.warn('test');
        expect(console.log).not.toHaveBeenCalled();
        expect(console.warn).toHaveBeenCalledWith('test');
      });
    });

    it('restores the original console.log', () => {
      expect(console.warn).toBe(original);
    });
  });

  describe('restore', () => {
    let originalLog: any;
    beforeAll(() => (originalLog = console.log));
    let originalWarn: any;
    beforeAll(() => (originalWarn = console.warn));

    describe('override', () => {
      ngMocks.ignoreOnConsole('log', 'warn');
      ngMocks.throwOnConsole('log', 'warn');

      it('replaces the log with a spy', () => {
        expect(console.log).not.toBe(originalLog);
        expect(console.warn).not.toBe(originalWarn);
      });
    });

    it('restores the original console.log', () => {
      expect(console.log).toBe(originalLog);
      expect(console.warn).toBe(originalWarn);
    });
  });
});
