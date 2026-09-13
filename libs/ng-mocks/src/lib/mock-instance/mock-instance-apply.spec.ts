import { Injector } from '@angular/core';

import ngMocksUniverse from '../common/ng-mocks-universe';
import { MockBuilderStash } from '../mock-builder/mock-builder-stash';
import helperDefinePropertyDescriptor from '../mock-service/helper.define-property-descriptor';

import mockInstanceApply from './mock-instance-apply';

describe('mock-instance-apply', () => {
  const stash = new MockBuilderStash();

  beforeEach(() => stash.backup());
  afterEach(() => stash.restore());

  for (const key of ['', 0, 7, Symbol('member')]) {
    it(`assigns a callable member at ${String(key)} without invoking it`, () => {
      class Target {}

      const stub = jasmine.createSpy('member');
      const instance: Record<PropertyKey, unknown> = {};
      ngMocksUniverse.configInstance.set(Target, {
        overloads: [[key, stub]],
      });

      const callbacks = mockInstanceApply(Target);

      expect(callbacks.length).toBe(1);
      expect(stub).not.toHaveBeenCalled();
      callbacks[0](instance);

      expect(instance[key]).toBe(stub);
      expect(stub).not.toHaveBeenCalled();
      expect(Object.getOwnPropertyDescriptor(instance, key)).toEqual({
        configurable: true,
        enumerable: true,
        value: stub,
        writable: true,
      });
    });
  }

  it('assigns an explicit undefined value when a member name is present', () => {
    class Target {}

    for (const key of ['', 0, 'value']) {
      const instance = { [key]: 'original' };
      ngMocksUniverse.configInstance.set(Target, {
        overloads: [[key, undefined]],
      });

      const callbacks = mockInstanceApply(Target);

      expect(callbacks.length).toBe(1);
      callbacks[0](instance);

      expect(Object.getOwnPropertyDescriptor(instance, key)).toEqual({
        configurable: true,
        enumerable: true,
        value: undefined,
        writable: true,
      });
    }
  });

  it('preserves an initializer when its member name is absent', () => {
    class Target {}

    const result = { value: 'configured' };
    const initializer = jasmine
      .createSpy('initializer')
      .and.returnValue(result);
    const instance = new Target();
    const injector = Injector.create({ providers: [] });
    ngMocksUniverse.configInstance.set(Target, {
      overloads: [[undefined, initializer]],
    });

    const callbacks = mockInstanceApply(Target);

    expect(callbacks).toEqual([initializer]);
    expect(callbacks[0]).toBe(initializer);
    expect(initializer).not.toHaveBeenCalled();
    expect(callbacks[0](instance, injector)).toBe(result);
    expect(initializer).toHaveBeenCalledTimes(1);
    expect(initializer).toHaveBeenCalledWith(instance, injector);
  });

  it('customizes a zero-keyed accessor without invoking or losing its counterpart', () => {
    class Target {}

    const originalGetter = jasmine.createSpy('originalGetter');
    const originalSetter = jasmine.createSpy('originalSetter');
    const getter = jasmine
      .createSpy('getter')
      .and.returnValue('configured');
    const setter = jasmine.createSpy('setter');
    const instance: Record<number, string> = {};
    helperDefinePropertyDescriptor(instance, 0, {
      enumerable: true,
      get: originalGetter,
      set: originalSetter,
    });
    ngMocksUniverse.configInstance.set(Target, {
      overloads: [
        [0, getter, 'get'],
        [0, setter, 'set'],
      ],
    });

    const callbacks = mockInstanceApply(Target);

    expect(callbacks.length).toBe(2);
    callbacks[0](instance);
    expect(Object.getOwnPropertyDescriptor(instance, 0)).toEqual({
      configurable: true,
      enumerable: true,
      get: getter,
      set: originalSetter,
    });
    callbacks[1](instance);
    expect(Object.getOwnPropertyDescriptor(instance, 0)).toEqual({
      configurable: true,
      enumerable: true,
      get: getter,
      set: setter,
    });
    expect(getter).not.toHaveBeenCalled();
    expect(setter).not.toHaveBeenCalled();

    expect(instance[0]).toBe('configured');
    instance[0] = 'updated';

    expect(getter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledTimes(1);
    expect(setter).toHaveBeenCalledWith('updated');
    expect(originalGetter).not.toHaveBeenCalled();
    expect(originalSetter).not.toHaveBeenCalled();
  });
});
