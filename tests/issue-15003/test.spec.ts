import { InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockService, ngMocks } from 'ng-mocks';

const providerCalls: string[] = [];
const providerRequest = (value: string): string => {
  providerCalls.push(value);

  return `real:${value}`;
};
const providerShape = {
  constructor: undefined,
  request: providerRequest,
};
const TOKEN = new InjectionToken<typeof providerShape>(
  'issue-15003-provider',
);

@NgModule({
  providers: [{ provide: TOKEN, useValue: providerShape }],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15003
describe('issue-15003', () => {
  for (const constructor of [undefined, null, 'application data']) {
    it(`mocks an object with constructor ${constructor}`, () => {
      const calls: string[] = [];
      const shape = {
        constructor,
        request: (value: string): string => {
          calls.push(value);

          return 'real';
        },
      };
      const descriptor = Object.getOwnPropertyDescriptor(
        shape,
        'constructor',
      );
      const request = shape.request;

      const mock = MockService<typeof shape>(shape);

      expect(mock === shape).toBe(false);
      expect(Object.getPrototypeOf(mock)).toBe(Object.prototype);
      expect(mock.request).not.toBe(request);
      expect(mock.request('mock')).toBeUndefined();
      expect(calls).toEqual([]);
      expect(shape.request).toBe(request);
      expect(Object.getPrototypeOf(shape)).toBe(Object.prototype);
      expect(
        Object.getOwnPropertyDescriptor(shape, 'constructor'),
      ).toEqual(descriptor);
    });
  }

  it('mocks a null-prototype object with an own method and accessor pair', () => {
    const calls: string[] = [];
    const shape: { request: () => string; value: string } =
      Object.create(null);
    shape.request = () => {
      calls.push('request');

      return 'real';
    };
    const accessors = {
      get value(): string {
        calls.push('get');

        return 'real value';
      },
      set value(value: string) {
        calls.push(`set:${value}`);
      },
    };
    const descriptor = Object.getOwnPropertyDescriptor(
      accessors,
      'value',
    );
    const request = shape.request;

    // Copy the complete pair without looking up a prior target accessor.
    ngMocks.stub(shape, accessors);
    expect(Object.getOwnPropertyDescriptor(shape, 'value')).toEqual(
      descriptor,
    );
    expect(calls).toEqual([]);

    const mock = MockService<typeof shape>(shape);

    expect(mock === shape).toBe(false);
    expect(Object.getPrototypeOf(mock)).toBeNull();
    expect(mock.request).not.toBe(request);
    expect(mock.request()).toBeUndefined();
    expect(mock.value).toBeUndefined();
    mock.value = 'mock';
    expect(mock.value).toBe('mock');
    expect(calls).toEqual([]);
    expect(Object.getPrototypeOf(shape)).toBeNull();
    expect(shape.request).toBe(request);
    expect(Object.getOwnPropertyDescriptor(shape, 'value')).toEqual(
      descriptor,
    );
    expect(
      Object.getOwnPropertyDescriptor(accessors, 'value'),
    ).toEqual(descriptor);
  });

  for (const terminal of [false, true]) {
    it(`mocks methods inherited from a ${terminal ? 'terminal' : 'custom'} prototype`, () => {
      const calls: string[] = [];
      const prototype = {
        request: (value: string): string => {
          calls.push(value);

          return 'real';
        },
      };
      if (terminal) {
        Object.setPrototypeOf(prototype, null);
      }
      const shape: typeof prototype = Object.create(prototype);
      const descriptor = Object.getOwnPropertyDescriptor(
        prototype,
        'request',
      );

      const mock = MockService<typeof shape>(shape);

      expect(Object.getPrototypeOf(mock) === prototype).toBe(true);
      expect(
        Object.prototype.hasOwnProperty.call(mock, 'request'),
      ).toBe(true);
      expect(mock.request).not.toBe(prototype.request);
      expect(mock.request('mock')).toBeUndefined();
      expect(calls).toEqual([]);
      expect(Object.getPrototypeOf(shape) === prototype).toBe(true);
      expect(
        Object.getOwnPropertyDescriptor(shape, 'request'),
      ).toBeUndefined();
      expect(
        Object.getOwnPropertyDescriptor(prototype, 'request'),
      ).toEqual(descriptor);
      expect(
        Object.getPrototypeOf(prototype) ===
          (terminal ? null : Object.prototype),
      ).toBe(true);
    });
  }

  it('does not read an own constructor getter', () => {
    const calls: string[] = [];
    const shape = {
      get constructor(): typeof Object {
        calls.push('constructor getter');

        return Object;
      },
      request: (): string => {
        calls.push('request');

        return 'real';
      },
    };
    const descriptor = Object.getOwnPropertyDescriptor(
      shape,
      'constructor',
    );
    const request = shape.request;

    const mock = MockService<typeof shape>(shape);

    expect(calls).toEqual([]);
    expect(mock === shape).toBe(false);
    expect(Object.getPrototypeOf(mock)).toBe(Object.prototype);
    expect(mock.constructor).toBeUndefined();
    expect(mock.request).not.toBe(request);
    expect(mock.request()).toBeUndefined();
    expect(calls).toEqual([]);
    expect(shape.request).toBe(request);
    expect(Object.getPrototypeOf(shape)).toBe(Object.prototype);
    expect(
      Object.getOwnPropertyDescriptor(shape, 'constructor'),
    ).toEqual(descriptor);
  });

  it('does not read a constructor getter on the actual prototype', () => {
    const calls: string[] = [];
    const prototype = {
      get constructor(): typeof Object {
        calls.push('constructor getter');

        return Object;
      },
      request: (): string => {
        calls.push('request');

        return 'real';
      },
    };
    const shape: { request: () => string } = Object.create(prototype);
    const descriptor = Object.getOwnPropertyDescriptor(
      prototype,
      'constructor',
    );
    const request = prototype.request;

    const mock = MockService<typeof shape>(shape);

    expect(calls).toEqual([]);
    expect(Object.getPrototypeOf(mock) === prototype).toBe(true);
    expect(
      Object.prototype.hasOwnProperty.call(mock, 'request'),
    ).toBe(true);
    expect(mock.request).not.toBe(request);
    expect(mock.request()).toBeUndefined();
    expect(calls).toEqual([]);
    expect(Object.getPrototypeOf(shape) === prototype).toBe(true);
    expect(prototype.request).toBe(request);
    expect(
      Object.getOwnPropertyDescriptor(shape, 'request'),
    ).toBeUndefined();
    expect(
      Object.getOwnPropertyDescriptor(prototype, 'constructor'),
    ).toEqual(descriptor);
  });

  it('preserves shared references and cycles in a nested null-prototype shape', () => {
    interface Shape {
      request: (value: string) => string;
      alias: (value: string) => string;
      self: Shape;
    }
    const calls: string[] = [];
    const request = (value: string): string => {
      calls.push(value);

      return 'real';
    };
    const shape: Shape = Object.create(null);
    shape.request = request;
    shape.alias = request;
    shape.self = shape;
    const wrapper = { first: shape, second: shape };

    const mock = MockService<typeof wrapper>(wrapper);
    const independent = MockService<typeof wrapper>(wrapper);

    expect(mock === wrapper).toBe(false);
    expect(mock.first === shape).toBe(false);
    expect(mock.first === mock.second).toBe(true);
    expect(mock.first.self === mock.first).toBe(true);
    expect(Object.getPrototypeOf(mock.first)).toBeNull();
    expect(mock.first.request).toBe(mock.first.alias);
    expect(mock.first.request).not.toBe(request);
    expect(independent.first === mock.first).toBe(false);
    expect(independent.first === independent.second).toBe(true);
    expect(independent.first.self === independent.first).toBe(true);
    expect(independent.first.request).not.toBe(mock.first.request);
    expect(mock.first.request('first')).toBeUndefined();
    expect(mock.second.alias('second')).toBeUndefined();
    expect(independent.first.request('independent')).toBeUndefined();
    expect(calls).toEqual([]);
    expect(wrapper.first === shape).toBe(true);
    expect(wrapper.second === shape).toBe(true);
    expect(shape.self === shape).toBe(true);
    expect(shape.request).toBe(request);
    expect(shape.alias).toBe(request);
    expect(Object.getPrototypeOf(shape)).toBeNull();
  });

  it('accepts the original object-valued provider in a real module', async () => {
    providerCalls.length = 0;
    await TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents();

    const value = ngMocks.get(TOKEN);

    expect(value.request).toBe(providerRequest);
    expect(value.request('native')).toBe('real:native');
    expect(providerCalls).toEqual(['native']);
    expect(providerShape.request).toBe(providerRequest);
    expect(providerShape.constructor).toBeUndefined();
  });

  it('mocks an object-valued module provider without a usable constructor', async () => {
    providerCalls.length = 0;
    const descriptor = Object.getOwnPropertyDescriptor(
      providerShape,
      'constructor',
    );

    await MockBuilder(null, TargetModule);
    const value = ngMocks.get(TOKEN);

    expect(ngMocks.get(TOKEN) === value).toBe(true);
    expect(value.request).not.toBe(providerRequest);
    expect(value.request('mock')).toBeUndefined();
    expect(providerCalls).toEqual([]);
    expect(providerShape.request).toBe(providerRequest);
    expect(
      Object.getOwnPropertyDescriptor(providerShape, 'constructor'),
    ).toEqual(descriptor);
  });
});
