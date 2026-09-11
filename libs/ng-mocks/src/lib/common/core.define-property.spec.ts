import coreDefineProperty from './core.define-property';

describe('core.define-property', () => {
  it('preserves writable and configurable defaults and explicit enumerability', () => {
    const instance = {};
    const value = {};

    coreDefineProperty(instance, 'value', value);
    coreDefineProperty(instance, 'visible', value, true);

    expect(
      Object.getOwnPropertyDescriptor(instance, 'value'),
    ).toEqual({
      configurable: true,
      enumerable: false,
      value,
      writable: true,
    });
    expect(
      Object.getOwnPropertyDescriptor(instance, 'visible'),
    ).toEqual({
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
  });

  it('supports nonconfigurable properties without making their values readonly', () => {
    const instance: Record<keyof any, any> = {};
    const property = Symbol('value');

    coreDefineProperty(instance, property, 'original', false, false);

    expect(
      Object.getOwnPropertyDescriptor(instance, property),
    ).toEqual({
      configurable: false,
      enumerable: false,
      value: 'original',
      writable: true,
    });
    instance[property] = 'assigned';
    expect(instance[property]).toBe('assigned');

    // Defining a new descriptor must continue to leave locked own properties alone.
    coreDefineProperty(instance, property, 'replacement');
    expect(instance[property]).toBe('assigned');
    expect(
      Object.getOwnPropertyDescriptor(instance, property)!
        .configurable,
    ).toBe(false);
  });

  it('shadows inherited locked data without changing the original descriptor', () => {
    const parent = {};
    // This fixture also requires writable:false, which the value helper does not provide.
    Object.defineProperty(parent, 'value', { value: 'parent' });
    const descriptor = Object.getOwnPropertyDescriptor(
      parent,
      'value',
    );
    const child = Object.create(parent);

    coreDefineProperty(child, 'value', 'child');
    coreDefineProperty(parent, 'value', 'replacement');

    expect(child.value).toBe('child');
    expect(Object.getOwnPropertyDescriptor(child, 'value')).toEqual({
      configurable: true,
      enumerable: false,
      value: 'child',
      writable: true,
    });
    expect(Object.getOwnPropertyDescriptor(parent, 'value')).toEqual(
      descriptor,
    );
  });

  it('shadows inherited locked getters without invoking them', () => {
    const parent = {};
    const getter = jasmine
      .createSpy('getter')
      .and.returnValue('parent');
    Object.defineProperty(parent, 'value', { get: getter });
    const descriptor = Object.getOwnPropertyDescriptor(
      parent,
      'value',
    );
    const child = Object.create(parent);

    coreDefineProperty(child, 'value', 'child', true);

    expect(child.value).toBe('child');
    expect(getter).not.toHaveBeenCalled();
    expect(Object.getOwnPropertyDescriptor(child, 'value')).toEqual({
      configurable: true,
      enumerable: true,
      value: 'child',
      writable: true,
    });
    expect(Object.getOwnPropertyDescriptor(parent, 'value')).toEqual(
      descriptor,
    );
  });

  it('ignores missing instances', () => {
    for (const instance of [undefined, null, false, 0, '']) {
      expect(
        coreDefineProperty(instance, 'value', 'ignored'),
      ).toBeUndefined();
    }
  });

  it('preserves assignment fallback when native property definition is unavailable', () => {
    const defineProperty = Object.defineProperty;
    const instance: Record<string, string> = {};

    try {
      Object.defineProperty = undefined as never;
      coreDefineProperty(instance, 'value', 'assigned');
    } finally {
      Object.defineProperty = defineProperty;
    }

    expect(instance.value).toBe('assigned');
  });
});
