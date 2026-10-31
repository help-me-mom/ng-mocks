import { ngMocks } from 'ng-mocks';

describe('ng-mocks-throw-on-console:descriptors', () => {
  let original: PropertyDescriptor;
  beforeAll(() => {
    original = Object.getOwnPropertyDescriptor(console, 'warn') || {};
  });

  describe('override', () => {
    ngMocks.throwOnConsole();

    it('preserves the descriptor while replacing the method', () => {
      expect(
        Object.getOwnPropertyDescriptor(console, 'warn'),
      ).toEqual({
        ...original,
        value: console.warn,
      });
      expect(console.warn).not.toBe(original.value);
    });
  });

  it('restores the method and its descriptor', () => {
    expect(Object.getOwnPropertyDescriptor(console, 'warn')).toEqual(
      original,
    );
  });
});
