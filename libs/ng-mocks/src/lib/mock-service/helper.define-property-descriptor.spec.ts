import helperDefinePropertyDescriptor from './helper.define-property-descriptor';

describe('helper.define-property-descriptor', () => {
  it('keeps copied descriptors configurable by default', () => {
    const instance = {};

    expect(
      helperDefinePropertyDescriptor(instance, 'value', {
        configurable: false,
        value: 'original',
        writable: false,
      }),
    ).toBe(true);
    expect(
      Object.getOwnPropertyDescriptor(instance, 'value'),
    ).toEqual({
      configurable: true,
      enumerable: false,
      value: 'original',
      writable: true,
    });

    expect(
      helperDefinePropertyDescriptor(instance, 'value', {
        value: 'replacement',
      }),
    ).toBe(true);
    expect(
      Object.getOwnPropertyDescriptor(instance, 'value')!.value,
    ).toBe('replacement');
  });

  it('shadows inherited locked data without changing the ancestor or siblings', () => {
    const parent = {};
    Object.defineProperty(parent, 'value', { value: 'parent' });
    const descriptor = Object.getOwnPropertyDescriptor(
      parent,
      'value',
    );
    const child = Object.create(parent);
    const sibling = Object.create(parent);

    expect(
      helperDefinePropertyDescriptor(child, 'value', {
        value: 'child',
      }),
    ).toBe(true);

    expect(Object.getOwnPropertyDescriptor(child, 'value')).toEqual({
      configurable: true,
      enumerable: false,
      value: 'child',
      writable: true,
    });
    expect(child.value).toBe('child');
    expect(sibling.value).toBe('parent');
    expect(Object.getOwnPropertyDescriptor(parent, 'value')).toEqual(
      descriptor,
    );
  });

  it('shadows inherited locked accessors without invoking them', () => {
    const parent = {};
    const original = jasmine
      .createSpy('original')
      .and.returnValue('parent');
    const replacement = jasmine
      .createSpy('replacement')
      .and.returnValue('child');
    Object.defineProperty(parent, 'value', { get: original });
    const descriptor = Object.getOwnPropertyDescriptor(
      parent,
      'value',
    );
    const child = Object.create(parent);

    expect(
      helperDefinePropertyDescriptor(child, 'value', {
        get: replacement,
      }),
    ).toBe(true);

    expect(original).not.toHaveBeenCalled();
    expect(replacement).not.toHaveBeenCalled();
    expect(Object.getOwnPropertyDescriptor(child, 'value')).toEqual({
      configurable: true,
      enumerable: false,
      get: replacement,
      set: undefined,
    });
    expect(child.value).toBe('child');
    expect(replacement).toHaveBeenCalledTimes(1);
    expect(original).not.toHaveBeenCalled();
    expect(Object.getOwnPropertyDescriptor(parent, 'value')).toEqual(
      descriptor,
    );
  });

  it('preserves a locked own property on a null-prototype target', () => {
    const instance = Object.create(null);
    Object.defineProperty(instance, 'value', { value: 'original' });
    const descriptor = Object.getOwnPropertyDescriptor(
      instance,
      'value',
    );

    expect(
      helperDefinePropertyDescriptor(instance, 'value', {
        value: 'replacement',
      }),
    ).toBe(false);

    expect(instance.value).toBe('original');
    expect(
      Object.getOwnPropertyDescriptor(instance, 'value'),
    ).toEqual(descriptor);
  });
});
