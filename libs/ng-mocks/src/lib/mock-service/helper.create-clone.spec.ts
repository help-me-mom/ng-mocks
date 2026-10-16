import coreDefineProperty from '../common/core.define-property';

import helperCreateClone from './helper.create-clone';
import helperDefinePropertyDescriptor from './helper.define-property-descriptor';

describe('helper.create-clone', () => {
  it('preserves arguments, results and receiver binding', () => {
    const source = function (
      this: { name: string },
      value: string,
      count: number,
    ): string {
      return `${this.name}:${value}:${count}`;
    };
    const original = { name: 'original' };
    const replacement = { name: 'replacement' };
    const other = { name: 'other' };
    const clone: typeof source = helperCreateClone(
      source,
      original,
      replacement,
    );

    expect(clone).not.toBe(source);
    expect(clone.call(original, 'first', 1)).toBe(
      'replacement:first:1',
    );
    expect(clone.call(other, 'second', 2)).toBe('other:second:2');
    expect(source.call(original, 'third', 3)).toBe(
      'original:third:3',
    );
    expect(original.name).toBe('original');
    expect(replacement.name).toBe('replacement');
  });

  it('delegates to an explicit mock while retaining the source metadata', () => {
    const calls: string[] = [];
    const source = Object.assign(
      function (this: { name: string }, value: string): string {
        calls.push('source');

        return `${this.name}:${value}`;
      },
      { label: 'source' },
    );
    const mock = Object.assign(
      function (this: { name: string }, value: string): string {
        calls.push(`mock:${this.name}:${value}`);

        return 'mock result';
      },
      { label: 'mock' },
    );
    const original = { name: 'original' };
    const replacement = { name: 'replacement' };
    const clone: typeof source = helperCreateClone(
      source,
      original,
      replacement,
      mock,
    );

    expect(calls).toEqual([]);
    expect(clone.label).toBe('source');
    expect(clone.call(original, 'value')).toBe('mock result');
    expect(calls).toEqual(['mock:replacement:value']);
    expect(source.label).toBe('source');
    expect(mock.label).toBe('mock');
  });

  it('copies the nearest string descriptors without invoking or changing inherited accessors', () => {
    const parentGetter = jasmine.createSpy('shadowed parent getter');
    const childGetter = jasmine.createSpy('child getter');
    const childSetter = jasmine.createSpy('child setter');
    const parent: object = Object.create(Function.prototype);
    // Locked source descriptors must stay intact while the clone remains writable.
    Object.defineProperties(parent, {
      inherited: { value: 'parent', enumerable: true },
      dataWins: { get: parentGetter, enumerable: true },
      accessorWins: { value: 'parent', enumerable: true },
    });
    const source = () => 'source';
    Object.setPrototypeOf(source, parent);
    Object.defineProperties(source, {
      dataWins: { value: 'child', enumerable: true },
      accessorWins: {
        get: childGetter,
        set: childSetter,
        enumerable: true,
      },
    });
    const parentData = Object.getOwnPropertyDescriptor(
      parent,
      'inherited',
    );
    const parentAccessor = Object.getOwnPropertyDescriptor(
      parent,
      'dataWins',
    );
    const childData = Object.getOwnPropertyDescriptor(
      source,
      'dataWins',
    );
    const childAccessor = Object.getOwnPropertyDescriptor(
      source,
      'accessorWins',
    );

    const clone: typeof source = helperCreateClone(source);

    expect(
      Object.getOwnPropertyDescriptor(clone, 'inherited'),
    ).toEqual({
      ...parentData,
      configurable: true,
      writable: true,
    });
    expect(
      Object.getOwnPropertyDescriptor(clone, 'dataWins'),
    ).toEqual({
      ...childData,
      configurable: true,
      writable: true,
    });
    expect(
      Object.getOwnPropertyDescriptor(clone, 'accessorWins'),
    ).toEqual({
      ...childAccessor,
      configurable: true,
    });
    expect(
      Object.getOwnPropertyDescriptor(parent, 'inherited'),
    ).toEqual(parentData);
    expect(
      Object.getOwnPropertyDescriptor(parent, 'dataWins'),
    ).toEqual(parentAccessor);
    expect(
      Object.getOwnPropertyDescriptor(source, 'dataWins'),
    ).toEqual(childData);
    expect(
      Object.getOwnPropertyDescriptor(source, 'accessorWins'),
    ).toEqual(childAccessor);
    expect(parentGetter).not.toHaveBeenCalled();
    expect(childGetter).not.toHaveBeenCalled();
    expect(childSetter).not.toHaveBeenCalled();
  });

  it('preserves symbol overrides and distinct symbols with the same description', () => {
    const member = Symbol('metadata');
    const sibling = Symbol('metadata');
    const parentGetter = jasmine.createSpy('shadowed symbol getter');
    const siblingGetter = jasmine.createSpy('distinct symbol getter');
    const parent: object = Object.create(Function.prototype);
    Object.defineProperties(parent, {
      [member]: { get: parentGetter, enumerable: true },
      [sibling]: { get: siblingGetter, enumerable: true },
    });
    const source = () => 'source';
    Object.setPrototypeOf(source, parent);
    Object.defineProperty(source, member, {
      value: 'child symbol',
      enumerable: true,
    });
    const parentSymbol = Object.getOwnPropertyDescriptor(
      parent,
      member,
    );
    const childSymbol = Object.getOwnPropertyDescriptor(
      source,
      member,
    );

    const clone: typeof source = helperCreateClone(source);

    expect(Object.getOwnPropertyDescriptor(clone, member)).toEqual({
      ...childSymbol,
      configurable: true,
      writable: true,
    });
    expect(Object.getOwnPropertyDescriptor(clone, sibling)).toEqual({
      get: siblingGetter,
      set: undefined,
      configurable: true,
      enumerable: true,
    });
    expect(Object.getOwnPropertyDescriptor(parent, member)).toEqual(
      parentSymbol,
    );
    expect(Object.getOwnPropertyDescriptor(source, member)).toEqual(
      childSymbol,
    );
    expect(parentGetter).not.toHaveBeenCalled();
    expect(siblingGetter).not.toHaveBeenCalled();
  });

  it('retains data-before-accessor order when a data key shadows an ancestor accessor', () => {
    const parent: object = Object.create(Function.prototype);
    helperDefinePropertyDescriptor(parent, 'shadowed', {
      get: () => 'parent',
    });
    coreDefineProperty(parent, 'inherited', 'parent');
    helperDefinePropertyDescriptor(parent, 'lastAccessor', {
      get: () => 'parent',
    });
    const source = () => 'source';
    Object.setPrototypeOf(source, parent);
    coreDefineProperty(source, 'first', 'child');
    coreDefineProperty(source, 'shadowed', 'child');
    helperDefinePropertyDescriptor(source, 'firstAccessor', {
      get: () => 'child',
    });

    const clone: typeof source = helperCreateClone(source);

    expect(
      Object.getOwnPropertyNames(clone).filter(
        key =>
          [
            'first',
            'shadowed',
            'inherited',
            'firstAccessor',
            'lastAccessor',
          ].indexOf(key) !== -1,
      ),
    ).toEqual([
      'first',
      'shadowed',
      'inherited',
      'firstAccessor',
      'lastAccessor',
    ]);
  });
});
