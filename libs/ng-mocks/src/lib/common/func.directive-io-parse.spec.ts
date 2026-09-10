import funcDirectiveIoParse from './func.directive-io-parse';

describe('funcDirectiveIoParse', () => {
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
