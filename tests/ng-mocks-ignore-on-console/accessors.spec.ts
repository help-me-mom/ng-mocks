/* eslint-disable no-console */

import { ngMocks } from 'ng-mocks';

describe('ng-mocks-ignore-on-console:accessors', () => {
  let original: PropertyDescriptor;
  let descriptor: PropertyDescriptor;
  let value: typeof console.log;
  let assignments = 0;

  beforeAll(() => {
    original = Object.getOwnPropertyDescriptor(console, 'log') || {};
    value = console.log;
    // Assignments must keep using an existing setter during mocking and restoration.
    Object.defineProperty(console, 'log', {
      configurable: true,
      enumerable: false,
      get: () => value,
      set: (next: typeof console.log) => {
        assignments += 1;
        value = next;
      },
    });
    descriptor =
      Object.getOwnPropertyDescriptor(console, 'log') || {};
  });
  afterAll(() => Object.defineProperty(console, 'log', original));

  describe('override', () => {
    ngMocks.ignoreOnConsole();

    it('uses the setter without replacing the accessor', () => {
      expect(assignments).toBe(1);
      expect(Object.getOwnPropertyDescriptor(console, 'log')).toEqual(
        descriptor,
      );
      expect(console.log).not.toBe(original.value);
    });
  });

  it('restores through the setter without changing the accessor', () => {
    expect(assignments).toBe(2);
    expect(console.log).toBe(original.value);
    expect(Object.getOwnPropertyDescriptor(console, 'log')).toEqual(
      descriptor,
    );
  });
});
