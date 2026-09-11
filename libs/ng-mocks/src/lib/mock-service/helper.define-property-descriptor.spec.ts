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

  it('preserves inherited descriptor protection unless explicitly disabled', () => {
    const parent = {};
    Object.defineProperty(parent, 'value', { value: 'parent' });
    const descriptor = Object.getOwnPropertyDescriptor(
      parent,
      'value',
    );
    const child = Object.create(parent);

    expect(
      helperDefinePropertyDescriptor(child, 'value', {
        value: 'child',
      }),
    ).toBe(false);

    expect(
      Object.getOwnPropertyDescriptor(child, 'value'),
    ).toBeUndefined();
    expect(child.value).toBe('parent');
    expect(Object.getOwnPropertyDescriptor(parent, 'value')).toEqual(
      descriptor,
    );
  });
});
