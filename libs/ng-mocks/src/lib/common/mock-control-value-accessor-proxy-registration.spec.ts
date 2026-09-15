import { ControlValueAccessor } from '@angular/forms';

import { MockControlValueAccessor } from './mock-control-value-accessor';
import { MockControlValueAccessorProxy } from './mock-control-value-accessor-proxy';

// @see https://github.com/help-me-mom/ng-mocks/issues/15032
describe('MockControlValueAccessorProxy:registration', () => {
  it('does not treat inherited or own simulation methods as registration', () => {
    class InheritedInstance {
      public readonly __ngMocksConfig = {
        isControlValueAccessor: true,
      };
      public __simulateChange(): void {}
      public __simulateTouch(): void {}
    }
    const inherited = new MockControlValueAccessorProxy();
    const own = new MockControlValueAccessorProxy();
    const instance = new InheritedInstance();
    inherited.instance = instance;
    own.instance = {
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
    };

    // CVA metadata and callable placeholders exist before Angular registers anything.
    expect(instance.__ngMocksConfig.isControlValueAccessor).toBe(
      true,
    );
    expect(inherited.isRegistered('__simulateChange')).toBe(false);
    expect(inherited.isRegistered('__simulateTouch')).toBe(false);
    expect(own.isRegistered('__simulateChange')).toBe(false);
    expect(own.isRegistered('__simulateTouch')).toBe(false);
  });

  it('stores and forwards the exact change and touch callbacks independently', () => {
    const proxy = new MockControlValueAccessorProxy();
    const forwardedChanges: Array<(value: unknown) => void> = [];
    const forwardedTouches: Array<() => void> = [];
    const values: unknown[] = [];
    const touches: string[] = [];
    const payload = { inputValue: 'updated' };
    const change = (value: unknown): void => {
      values.push(value);
    };
    const touch = (): void => {
      touches.push('touched');
    };
    const instance: MockControlValueAccessor &
      Partial<ControlValueAccessor> = {
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnChange: (
        callback: (value: unknown) => void,
      ): void => {
        forwardedChanges.push(callback);
      },
      registerOnTouched: (callback: () => void): void => {
        forwardedTouches.push(callback);
      },
    };
    proxy.instance = instance;

    proxy.registerOnChange(change);

    // Registering a change must not imply that a touch callback was registered.
    expect(proxy.isRegistered('__simulateChange')).toBe(true);
    expect(proxy.isRegistered('__simulateTouch')).toBe(false);
    expect(instance.__simulateChange).toBe(change);
    expect(forwardedChanges).toEqual([change]);
    expect(forwardedTouches).toEqual([]);
    expect(values).toEqual([]);

    proxy.registerOnTouched(touch);

    expect(proxy.isRegistered('__simulateChange')).toBe(true);
    expect(proxy.isRegistered('__simulateTouch')).toBe(true);
    expect(instance.__simulateTouch).toBe(touch);
    expect(forwardedTouches).toEqual([touch]);
    expect(touches).toEqual([]);

    // The original functions receive the original payload, without a wrapper or copy.
    instance.__simulateChange(payload);
    instance.__simulateTouch();
    expect(values.length).toBe(1);
    expect(values[0]).toBe(payload);
    expect(touches).toEqual(['touched']);
  });

  it('does not infer change registration from a registered touch callback', () => {
    const proxy = new MockControlValueAccessorProxy();
    proxy.instance = {
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnTouched: () => undefined,
    };

    proxy.registerOnTouched(() => undefined);

    expect(proxy.isRegistered('__simulateTouch')).toBe(true);
    expect(proxy.isRegistered('__simulateChange')).toBe(false);
  });

  it('allows the same no-op function to be registered for both operations', () => {
    const proxy = new MockControlValueAccessorProxy();
    const callback = (): void => undefined;
    const instance = {
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnChange: () => undefined,
      registerOnTouched: () => undefined,
    };
    proxy.instance = instance;

    // An actual registration counts even when the callback intentionally does nothing.
    proxy.registerOnChange(callback);
    proxy.registerOnTouched(callback);

    expect(instance.__simulateChange).toBe(callback);
    expect(instance.__simulateTouch).toBe(callback);
    expect(proxy.isRegistered('__simulateChange')).toBe(true);
    expect(proxy.isRegistered('__simulateTouch')).toBe(true);
  });

  it('keeps registration local to the proxy and the attached instance', () => {
    const config = { isControlValueAccessor: true };
    const instance = {
      __ngMocksConfig: config,
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnChange: () => undefined,
    };
    const sibling = {
      __ngMocksConfig: config,
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnChange: () => undefined,
    };
    const proxy = new MockControlValueAccessorProxy();
    const otherProxy = new MockControlValueAccessorProxy();
    const siblingProxy = new MockControlValueAccessorProxy();
    proxy.instance = instance;
    otherProxy.instance = instance;
    siblingProxy.instance = sibling;

    proxy.registerOnChange(() => undefined);

    // Neither shared metadata nor another proxy's instance proves registration here.
    expect(proxy.isRegistered('__simulateChange')).toBe(true);
    expect(proxy.isRegistered('__simulateTouch')).toBe(false);
    expect(otherProxy.isRegistered('__simulateChange')).toBe(false);
    expect(otherProxy.isRegistered('__simulateTouch')).toBe(false);
    expect(siblingProxy.isRegistered('__simulateChange')).toBe(false);
    expect(siblingProxy.isRegistered('__simulateTouch')).toBe(false);
  });

  it('replaces the registered callback when Angular registers it again', () => {
    const proxy = new MockControlValueAccessorProxy();
    const forwardedChanges: Array<() => void> = [];
    const forwardedTouches: Array<() => void> = [];
    const first = (): void => undefined;
    const second = (): void => undefined;
    const instance = {
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnChange: (callback: () => void): void => {
        forwardedChanges.push(callback);
      },
      registerOnTouched: (callback: () => void): void => {
        forwardedTouches.push(callback);
      },
    };
    proxy.instance = instance;

    proxy.registerOnChange(first);
    proxy.registerOnTouched(first);
    proxy.registerOnChange(second);
    proxy.registerOnTouched(second);

    expect(instance.__simulateChange).toBe(second);
    expect(instance.__simulateTouch).toBe(second);
    expect(forwardedChanges).toEqual([first, second]);
    expect(forwardedTouches).toEqual([first, second]);
    expect(proxy.isRegistered('__simulateChange')).toBe(true);
    expect(proxy.isRegistered('__simulateTouch')).toBe(true);
  });

  it('does not transfer registration from a missing instance to a later attachment', () => {
    const proxy = new MockControlValueAccessorProxy();
    const callback = (): void => undefined;
    proxy.registerOnChange(callback);
    proxy.registerOnTouched(callback);

    expect(proxy.isRegistered('__simulateChange')).toBe(false);
    expect(proxy.isRegistered('__simulateTouch')).toBe(false);

    // Attaching matching functions later must not invent a registration on this instance.
    proxy.instance = {
      __simulateChange: callback,
      __simulateTouch: callback,
    };
    expect(proxy.isRegistered('__simulateChange')).toBe(false);
    expect(proxy.isRegistered('__simulateTouch')).toBe(false);
  });

  it('does not transfer registration to a replacement instance', () => {
    const proxy = new MockControlValueAccessorProxy();
    const callback = (): void => undefined;
    proxy.instance = {
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnChange: () => undefined,
      registerOnTouched: () => undefined,
    };
    proxy.registerOnChange(callback);
    proxy.registerOnTouched(callback);

    expect(proxy.isRegistered('__simulateChange')).toBe(true);
    expect(proxy.isRegistered('__simulateTouch')).toBe(true);

    // Callback identity alone cannot connect a different rendered instance.
    proxy.instance = {
      __simulateChange: callback,
      __simulateTouch: callback,
    };
    expect(proxy.isRegistered('__simulateChange')).toBe(false);
    expect(proxy.isRegistered('__simulateTouch')).toBe(false);
  });

  it('preserves registered callbacks when users wrap the simulation functions', () => {
    const proxy = new MockControlValueAccessorProxy();
    const values: unknown[] = [];
    const touches: string[] = [];
    const wrappers: string[] = [];
    const change = (value: unknown): void => {
      values.push(value);
    };
    const touch = (): void => {
      touches.push('touched');
    };
    const instance: MockControlValueAccessor &
      Partial<ControlValueAccessor> = {
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnChange: () => undefined,
      registerOnTouched: () => undefined,
    };
    proxy.instance = instance;
    proxy.registerOnChange(change);
    proxy.registerOnTouched(touch);
    expect(instance.__simulateChange).toBe(change);
    expect(instance.__simulateTouch).toBe(touch);

    // Existing tests wrap these functions to observe a real registration's calls.
    const registeredChange = instance.__simulateChange;
    const registeredTouch = instance.__simulateTouch;
    instance.__simulateChange = value => {
      wrappers.push('change');
      registeredChange(value);
    };
    instance.__simulateTouch = () => {
      wrappers.push('touch');
      registeredTouch();
    };
    expect(proxy.isRegistered('__simulateChange')).toBe(true);
    expect(proxy.isRegistered('__simulateTouch')).toBe(true);

    const payload = { inputValue: 'updated' };
    instance.__simulateChange(payload);
    instance.__simulateTouch();
    expect(wrappers).toEqual(['change', 'touch']);
    expect(values.length).toBe(1);
    expect(values[0]).toBe(payload);
    expect(touches).toEqual(['touched']);

    // Registration does not make a removed simulation function callable.
    Object.assign(instance, { __simulateChange: undefined });
    expect(proxy.isRegistered('__simulateChange')).toBe(false);
    expect(proxy.isRegistered('__simulateTouch')).toBe(true);
    Object.assign(instance, { __simulateTouch: undefined });
    expect(proxy.isRegistered('__simulateChange')).toBe(false);
    expect(proxy.isRegistered('__simulateTouch')).toBe(false);
  });

  it('does not treat an undefined callback as registration', () => {
    const proxy = new MockControlValueAccessorProxy();
    const callback = (): void => undefined;
    proxy.instance = {
      __simulateChange: () => undefined,
      __simulateTouch: () => undefined,
      registerOnChange: () => undefined,
      registerOnTouched: () => undefined,
    };
    proxy.registerOnChange(callback);
    proxy.registerOnTouched(callback);

    proxy.registerOnChange(undefined);
    expect(proxy.isRegistered('__simulateChange')).toBe(false);
    expect(proxy.isRegistered('__simulateTouch')).toBe(true);

    proxy.registerOnTouched(undefined);
    expect(proxy.isRegistered('__simulateChange')).toBe(false);
    expect(proxy.isRegistered('__simulateTouch')).toBe(false);
  });
});
