import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';

describe('helper.extract-property-descriptor', () => {
  it('returns undefined on null', () => {
    expect(
      helperExtractPropertyDescriptor(null, 'test'),
    ).toBeUndefined();
  });

  // @see https://github.com/help-me-mom/ng-mocks/issues/15003
  it('inspects terminal user objects and their inherited descriptors without invoking them', () => {
    const calls: string[] = [];
    const source = {
      read: () => {
        calls.push('read');
        return 'real';
      },
      get value(): string {
        calls.push('get');
        return 'real';
      },
      set value(value: string) {
        calls.push(value);
      },
    };
    Object.setPrototypeOf(source, null);
    const child = { value: 'own' };
    Object.setPrototypeOf(child, source);
    const method = Object.getOwnPropertyDescriptor(source, 'read');
    const accessor = Object.getOwnPropertyDescriptor(source, 'value');
    const own = Object.getOwnPropertyDescriptor(child, 'value');

    expect(helperExtractPropertyDescriptor(source, 'read')).toEqual(
      method,
    );
    expect(helperExtractPropertyDescriptor(source, 'value')).toEqual(
      accessor,
    );
    expect(helperExtractPropertyDescriptor(child, 'read')).toEqual(
      method,
    );
    expect(helperExtractPropertyDescriptor(child, 'value')).toEqual(
      own,
    );
    expect(
      helperExtractPropertyDescriptor(child, 'missing'),
    ).toBeUndefined();
    expect(Object.getOwnPropertyDescriptor(source, 'read')).toEqual(
      method,
    );
    expect(Object.getOwnPropertyDescriptor(source, 'value')).toEqual(
      accessor,
    );
    expect(Object.getOwnPropertyDescriptor(child, 'value')).toEqual(
      own,
    );
    expect(calls).toEqual([]);
  });

  it('continues to exclude Object.prototype descriptors', () => {
    expect(
      helperExtractPropertyDescriptor({}, 'toString'),
    ).toBeUndefined();
    expect(
      helperExtractPropertyDescriptor({}, 'constructor'),
    ).toBeUndefined();
    expect(
      helperExtractPropertyDescriptor(
        Object.prototype,
        'hasOwnProperty',
      ),
    ).toBeUndefined();
  });
});
