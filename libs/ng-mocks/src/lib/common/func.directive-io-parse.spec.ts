import funcDirectiveIoParse from './func.directive-io-parse';

describe('funcDirectiveIoParse', () => {
  it('keeps names without aliases from strings', () => {
    expect(funcDirectiveIoParse('value')).toEqual({
      name: 'value',
    });
    expect(funcDirectiveIoParse('valueChange')).toEqual({
      name: 'valueChange',
    });
  });

  it('keeps names without aliases from objects', () => {
    expect(funcDirectiveIoParse({ name: 'value' })).toEqual({
      name: 'value',
    });
    expect(funcDirectiveIoParse({ name: 'valueChange' })).toEqual({
      name: 'valueChange',
    });
  });

  it('keeps required metadata without an alias', () => {
    expect(
      funcDirectiveIoParse({ name: 'value', required: true }),
    ).toEqual({ name: 'value', required: true });
    expect(
      funcDirectiveIoParse({ name: 'value', required: false }),
    ).toEqual({ name: 'value', required: false });
  });

  it('keeps signal flags and transforms without an alias', () => {
    expect(
      funcDirectiveIoParse({
        isSignal: true,
        name: 'value',
        transform: String,
      }),
    ).toEqual({ isSignal: true, name: 'value', transform: String });
    expect(
      funcDirectiveIoParse({
        isSignal: false,
        name: 'value',
        transform: Number,
      }),
    ).toEqual({ isSignal: false, name: 'value', transform: Number });
  });

  it('omits redundant aliases while preserving metadata', () => {
    expect(funcDirectiveIoParse('value:value')).toEqual({
      name: 'value',
    });
    expect(
      funcDirectiveIoParse({
        alias: 'value',
        isSignal: true,
        name: 'value',
        required: true,
        transform: String,
      }),
    ).toEqual({
      isSignal: true,
      name: 'value',
      required: true,
      transform: String,
    });
  });

  it('omits empty aliases while preserving metadata', () => {
    expect(funcDirectiveIoParse('value:')).toEqual({
      name: 'value',
    });
    expect(
      funcDirectiveIoParse({
        alias: '',
        isSignal: true,
        name: 'value',
        required: true,
        transform: String,
      }),
    ).toEqual({
      isSignal: true,
      name: 'value',
      required: true,
      transform: String,
    });
  });

  it('keeps regular aliases', () => {
    expect(funcDirectiveIoParse('prop:alias')).toEqual({
      alias: 'alias',
      name: 'prop',
    });
  });

  it('preserves Change aliases from strings', () => {
    expect(funcDirectiveIoParse('value:valueChange')).toEqual({
      alias: 'valueChange',
      name: 'value',
    });
  });

  it('preserves Change aliases from objects', () => {
    expect(
      funcDirectiveIoParse({
        alias: 'valueChange',
        name: 'value',
      }),
    ).toEqual({
      alias: 'valueChange',
      name: 'value',
    });
  });

  it('keeps required input metadata with Change aliases', () => {
    expect(
      funcDirectiveIoParse({
        alias: 'valueChange',
        name: 'value',
        required: true,
      }),
    ).toEqual({
      alias: 'valueChange',
      name: 'value',
      required: true,
    });
  });

  it('keeps signal input metadata', () => {
    expect(
      funcDirectiveIoParse({
        alias: 'alias',
        isSignal: true,
        name: 'value',
        transform: String,
      }),
    ).toEqual({
      alias: 'alias',
      isSignal: true,
      name: 'value',
      transform: String,
    });
  });
});
