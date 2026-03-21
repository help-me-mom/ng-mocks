import applyMockProperty from './helper.mock-property';
import helperMockService, {
  registerMockFunction,
} from './helper.mock-service';

describe('helper.mock-property', () => {
  let originalMockFunction: typeof helperMockService.mockFunction.customMockFunction;

  beforeEach(() => {
    originalMockFunction =
      helperMockService.mockFunction.customMockFunction;
  });

  afterEach(() => registerMockFunction(originalMockFunction));

  it('keeps function mocks as value properties', () => {
    const value: any = {};
    const mock = jasmine.createSpy('request');

    applyMockProperty(value, 'request', mock, 'prefix');

    expect(value.request).toBe(mock);
    expect(Object.getOwnPropertyDescriptor(value, 'request')).toEqual(
      jasmine.objectContaining({
        configurable: true,
        enumerable: true,
        value: mock,
        writable: true,
      }),
    );
  });

  it('composes accessor spies and mirrored tracker properties', () => {
    registerMockFunction(mockName => {
      const tracker: any = jasmine.createSpy(mockName);

      tracker.boundState = function () {
        return this.state;
      };
      tracker.state = {
        label: mockName,
      };

      return tracker;
    });

    const value: any = {};
    const original = {
      request: jasmine.createSpy('request'),
    };

    applyMockProperty(value, 'info', original, 'prefix');

    const descriptor = Object.getOwnPropertyDescriptor(
      value,
      'info',
    ) as PropertyDescriptor;
    const getter: any = descriptor.get;
    const setter: any = descriptor.set;
    const state = {
      label: 'next',
    };
    const ignored = {
      request: jasmine.createSpy('ignored'),
    };
    const next = {
      request: jasmine.createSpy('next'),
    };

    getter.state = state;
    expect(getter.boundState()).toBe(state);

    value.info = ignored;
    expect(value.info).toBe(ignored);

    setter.__ngMocksSet(undefined);
    value.info = original;
    expect(value.info).toBe(ignored);

    setter.__ngMocksSet((newValue: any) =>
      getter.__ngMocksGet(newValue),
    );
    value.info = next;
    expect(value.info).toBe(next);
  });
});
