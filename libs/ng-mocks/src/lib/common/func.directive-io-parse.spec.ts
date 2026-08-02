import funcDirectiveIoParse from './func.directive-io-parse';

describe('funcDirectiveIoParse', () => {
  it('keeps regular aliases', () => {
    expect(funcDirectiveIoParse('prop:alias')).toEqual({
      alias: 'alias',
      name: 'prop',
    });
  });

  it('normalizes signal model outputs from strings', () => {
    expect(funcDirectiveIoParse('value:valueChange')).toEqual({
      name: 'valueChange',
    });
  });

  it('normalizes signal model outputs from objects', () => {
    expect(
      funcDirectiveIoParse({
        alias: 'valueChange',
        name: 'value',
      }),
    ).toEqual({
      name: 'valueChange',
    });
  });

  it('keeps required metadata for signal model outputs', () => {
    expect(
      funcDirectiveIoParse({
        alias: 'valueChange',
        name: 'value',
        required: true,
      }),
    ).toEqual({
      name: 'valueChange',
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
