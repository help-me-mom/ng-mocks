import { ngMocks } from '../mock-helper/mock-helper';

import helperDefinePropertyDescriptor from './helper.define-property-descriptor';
import helperReplayInstance from './helper.replay-instance';
import { MockService } from './mock-service';

describe('helper.replay-instance', () => {
  it('returns early for empty or identical instances', () => {
    const instance = {};

    expect(() =>
      helperReplayInstance(undefined, instance),
    ).not.toThrow();
    expect(() =>
      helperReplayInstance(instance, instance),
    ).not.toThrow();
  });

  it('keeps generated accessor state local while replaying the same method spy', () => {
    class Target {
      public constructor() {
        throw new Error('original constructor');
      }

      public get value(): string {
        throw new Error('original getter');
      }

      public set value(value: string) {
        throw new Error(`original setter: ${value}`);
      }

      public echo(): string {
        throw new Error('original method');
      }
    }

    const seed = MockService(Target);
    const first = MockService(Target);
    const second = MockService(Target);
    const echo = jasmine
      .createSpy('echo')
      .and.returnValue('configured');
    ngMocks.stubMember(seed, 'echo', echo);

    helperReplayInstance(seed, first);
    helperReplayInstance(seed, second);

    expect(first.value).toBeUndefined();
    expect(second.value).toBeUndefined();
    first.value = 'first';
    second.value = 'second';
    expect(first.value).toBe('first');
    expect(second.value).toBe('second');
    expect(seed.value).toBeUndefined();

    first.value = 'updated';
    seed.value = 'seed';
    expect(first.value).toBe('updated');
    expect(second.value).toBe('second');
    expect(seed.value).toBe('seed');
    expect(first.echo).toBe(echo);
    expect(second.echo).toBe(echo);
    expect(seed.echo).toBe(echo);
    expect(first.echo()).toBe('configured');
    expect(second.echo()).toBe('configured');
    expect(echo).toHaveBeenCalledTimes(2);
  });

  it('copies an assigned generated accessor value without sharing subsequent writes', () => {
    class Target {
      public get value(): string {
        throw new Error('original getter');
      }

      public set value(value: string) {
        throw new Error(`original setter: ${value}`);
      }
    }

    const seed = MockService(Target);
    const first = MockService(Target);
    const second = MockService(Target);
    seed.value = 'initial';

    helperReplayInstance(seed, first);
    helperReplayInstance(seed, second);

    expect(first.value).toBe('initial');
    expect(second.value).toBe('initial');
    first.value = 'first';
    expect(first.value).toBe('first');
    expect(second.value).toBe('initial');
    expect(seed.value).toBe('initial');

    second.value = 'second';
    seed.value = 'updated seed';
    expect(first.value).toBe('first');
    expect(second.value).toBe('second');
    expect(seed.value).toBe('updated seed');

    const third = MockService(Target);
    helperReplayInstance(seed, third);
    expect(third.value).toBe('updated seed');
    third.value = 'third';
    expect(third.value).toBe('third');
    expect(first.value).toBe('first');
    expect(second.value).toBe('second');
    expect(seed.value).toBe('updated seed');
  });

  it('replaces configurable target accessors without invoking them and preserves locked targets', () => {
    class Target {
      public get value(): string {
        throw new Error('original getter');
      }

      public set value(value: string) {
        throw new Error(`original setter: ${value}`);
      }
    }

    const seed = MockService(Target);
    seed.value = 'initial';
    helperDefinePropertyDescriptor(seed, 'value', {
      ...Object.getOwnPropertyDescriptor(seed, 'value'),
      enumerable: false,
    });
    const seedDescriptor = Object.getOwnPropertyDescriptor(
      seed,
      'value',
    );
    const plain: Partial<Target> = {};
    const customized: Partial<Target> = {};
    const getter = jasmine
      .createSpy('target getter')
      .and.returnValue('target');
    const setter = jasmine.createSpy('target setter');
    helperDefinePropertyDescriptor(customized, 'value', {
      enumerable: true,
      get: getter,
      set: setter,
    });
    const locked = Object.freeze({ value: 'locked' });
    const lockedDescriptor = Object.getOwnPropertyDescriptor(
      locked,
      'value',
    );

    for (const target of [plain, customized]) {
      helperReplayInstance(seed, target);

      expect(target.value).toBe('initial');
      const descriptor = Object.getOwnPropertyDescriptor(
        target,
        'value',
      );
      expect(typeof descriptor?.get).toBe('function');
      expect(typeof descriptor?.set).toBe('function');
      expect(descriptor?.enumerable).toBe(false);
      expect(descriptor?.configurable).toBe(true);
    }
    helperReplayInstance(seed, locked);
    plain.value = 'plain';
    customized.value = 'customized';

    expect(plain.value).toBe('plain');
    expect(customized.value).toBe('customized');
    expect(seed.value).toBe('initial');
    expect(getter).not.toHaveBeenCalled();
    expect(setter).not.toHaveBeenCalled();
    expect(locked.value).toBe('locked');
    expect(Object.getOwnPropertyDescriptor(locked, 'value')).toEqual(
      lockedDescriptor,
    );
    expect(Object.getOwnPropertyDescriptor(seed, 'value')).toEqual(
      seedDescriptor,
    );
  });

  it('preserves a generated getter whose setter was explicitly removed', () => {
    class Target {
      public get value(): string {
        throw new Error('original getter');
      }

      public set value(value: string) {
        throw new Error(`original setter: ${value}`);
      }
    }

    const seed = MockService(Target);
    seed.value = 'configured';
    const getter = Object.getOwnPropertyDescriptor(
      seed,
      'value',
    )?.get;
    helperDefinePropertyDescriptor(seed, 'value', {
      enumerable: false,
      get: getter,
      set: undefined,
    });
    const target: Partial<Target> = {};

    helperReplayInstance(seed, target);

    expect(target.value).toBe('configured');
    expect(seed.value).toBe('configured');
    expect(Object.getOwnPropertyDescriptor(target, 'value')).toEqual({
      configurable: true,
      enumerable: false,
      get: getter,
      set: undefined,
    });
    expect(
      Object.getOwnPropertyDescriptor(target, 'value')?.get,
    ).toBe(getter);
    expect(
      Object.getOwnPropertyDescriptor(seed, 'value')?.set,
    ).toBeUndefined();
  });

  it('replays deliberate getter and setter replacements without invoking them', () => {
    class Target {
      public get read(): string {
        throw new Error('original getter');
      }

      public set read(value: string) {
        throw new Error(`original setter: ${value}`);
      }

      public get write(): string {
        throw new Error('original getter');
      }

      public set write(value: string) {
        throw new Error(`original setter: ${value}`);
      }
    }

    const seed = MockService(Target);
    const first = MockService(Target);
    const second = MockService(Target);
    const getter = jasmine
      .createSpy('getter')
      .and.returnValue('configured');
    const setter = jasmine.createSpy('setter');
    ngMocks.stubMember(seed, 'read', getter, 'get');
    ngMocks.stubMember(seed, 'write', setter, 'set');

    helperReplayInstance(seed, first);
    helperReplayInstance(seed, second);

    expect(getter).not.toHaveBeenCalled();
    expect(setter).not.toHaveBeenCalled();
    expect(Object.getOwnPropertyDescriptor(first, 'read')?.get).toBe(
      getter,
    );
    expect(Object.getOwnPropertyDescriptor(second, 'read')?.get).toBe(
      getter,
    );
    expect(Object.getOwnPropertyDescriptor(first, 'write')?.set).toBe(
      setter,
    );
    expect(
      Object.getOwnPropertyDescriptor(second, 'write')?.set,
    ).toBe(setter);
    expect(first.read).toBe('configured');
    expect(second.read).toBe('configured');
    expect(getter).toHaveBeenCalledTimes(2);
    first.write = 'first';
    second.write = 'second';
    expect(setter).toHaveBeenCalledWith('first');
    expect(setter).toHaveBeenCalledWith('second');
    expect(setter).toHaveBeenCalledTimes(2);
    expect(Object.getOwnPropertyDescriptor(seed, 'read')?.get).toBe(
      getter,
    );
    expect(Object.getOwnPropertyDescriptor(seed, 'write')?.set).toBe(
      setter,
    );
  });

  it('copies symbol descriptors and skips internal keys', () => {
    // Replay should preserve user-configured descriptors while leaving Angular internals alone.
    const symbol = Symbol('value');
    const seed: Record<keyof any, any> = {};
    const target: Record<keyof any, any> = {};

    Object.defineProperty(seed, symbol, {
      configurable: true,
      value: 'symbol',
    });
    Object.defineProperty(seed, '__ngContext__', {
      configurable: true,
      value: 'skip',
    });
    Object.defineProperty(seed, '__render', {
      configurable: true,
      value: 'skip',
    });
    Object.defineProperty(seed, 'ngMocksRender_block_views', {
      configurable: true,
      value: 'skip',
    });
    Object.defineProperty(seed, 'locked', {
      configurable: false,
      value: 'skip',
    });

    helperReplayInstance(seed, target);

    expect(target[symbol]).toEqual('symbol');
    expect(target.__ngContext__).toBeUndefined();
    expect(target.__render).toBeUndefined();
    expect(target.ngMocksRender_block_views).toBeUndefined();
    expect(target.locked).toBeUndefined();
  });
});
