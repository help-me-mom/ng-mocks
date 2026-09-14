import { Injector } from '@angular/core';

import { MockBuilderStash } from '../mock-builder/mock-builder-stash';

import { MockInstance } from './mock-instance';
import mockInstanceApply from './mock-instance-apply';

// @see https://github.com/help-me-mom/ng-mocks/issues/15008
describe('MockInstance:registration', () => {
  const stash = new MockBuilderStash();

  beforeEach(() => stash.backup());
  afterEach(() => stash.restore());
  MockInstance.scope();

  for (const config of [undefined, {}, { init: undefined }]) {
    it(`does not register an absent initializer from ${JSON.stringify(config)}`, () => {
      class Target {}

      MockInstance(Target, config);

      expect(mockInstanceApply(Target)).toEqual([]);
    });
  }

  it('preserves callback identities, order and arguments around empty configurations', () => {
    class Target {
      public value = 'initial';
    }
    const calls: string[] = [];
    const instance = new Target();
    const injector = Injector.create({ providers: [] });
    const returned = { value: 'returned' };
    const first = (
      value: Target,
      received: Injector | undefined,
    ): void => {
      expect(value).toBe(instance);
      expect(received).toBe(injector);
      calls.push('first');
      value.value = 'first';
    };
    const second = (
      value: Target,
      received: Injector | undefined,
    ) => {
      expect(value).toBe(instance);
      expect(received).toBe(injector);
      expect(value.value).toBe('first');
      calls.push('second');
      return returned;
    };

    MockInstance(Target, first);
    MockInstance(Target, undefined);
    MockInstance(Target, {});
    MockInstance(Target, { init: undefined });
    MockInstance(Target, { init: second });

    const callbacks = mockInstanceApply(Target);
    expect(callbacks).toEqual([first, second]);
    expect(callbacks[0]).toBe(first);
    expect(callbacks[callbacks.length - 1]).toBe(second);
    expect(calls).toEqual([]);
    callbacks[0](instance, injector);
    expect(callbacks[callbacks.length - 1](instance, injector)).toBe(
      returned,
    );
    expect(calls).toEqual(['first', 'second']);
  });

  it('retains explicit undefined member values and the no-argument reset', () => {
    class Target {
      public '': string | undefined = 'initial';
      public enabled = true;
      public count = 1;
      public text = 'initial';
    }
    const instance = new Target();

    MockInstance(Target, '', undefined);
    MockInstance(Target, 'enabled', false);
    MockInstance(Target, 'count', 0);
    MockInstance(Target, 'text', '');
    const callbacks = mockInstanceApply(Target);
    expect(callbacks.length).toBe(4);
    for (const callback of callbacks) {
      callback(instance);
    }
    expect(instance['']).toBeUndefined();
    expect(instance.enabled).toBe(false);
    expect(instance.count).toBe(0);
    expect(instance.text).toBe('');
    expect(
      Object.getOwnPropertyDescriptor(instance, '')?.value,
    ).toBeUndefined();

    MockInstance(Target);
    expect(mockInstanceApply(Target)).toEqual([]);
  });
});
