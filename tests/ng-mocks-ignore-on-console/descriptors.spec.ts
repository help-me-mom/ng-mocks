/* eslint-disable no-console */

import { ngMocks } from 'ng-mocks';

describe('ng-mocks-ignore-on-console:descriptors', () => {
  let original: PropertyDescriptor;
  beforeAll(() => {
    original = Object.getOwnPropertyDescriptor(console, 'log') || {};
  });

  describe('override', () => {
    ngMocks.ignoreOnConsole();

    it('preserves the descriptor while replacing the method', () => {
      expect(Object.getOwnPropertyDescriptor(console, 'log')).toEqual(
        {
          ...original,
          value: console.log,
        },
      );
      expect(console.log).not.toBe(original.value);
    });
  });

  it('restores the method and its descriptor', () => {
    expect(Object.getOwnPropertyDescriptor(console, 'log')).toEqual(
      original,
    );
  });
});
