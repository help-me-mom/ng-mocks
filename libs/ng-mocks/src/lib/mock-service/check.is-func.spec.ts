import checkIsFunc, { guessClass } from './check.is-func';

describe('check.is-func', () => {
  it('detects angular classes with known props', () => {
    const test = () => undefined;
    test.ɵprov = {};
    expect(checkIsFunc(test)).toEqual(false);
  });

  it('detects angular classes with __annotations__', () => {
    const test = () => undefined;
    test.__annotations__ = [] as never[];
    expect(checkIsFunc(test)).toEqual(false);
  });

  it('detects angular classes with __parameters__', () => {
    const test = () => undefined;
    test.__parameters__ = [] as never[];
    expect(checkIsFunc(test)).toEqual(false);
  });

  it('detects angular classes with parameters', () => {
    const test = () => undefined;
    test.parameters = [] as never[];
    expect(checkIsFunc(test)).toEqual(false);
  });

  it('detects downleveled unnamed classes', () => {
    expect(
      guessClass('classTarget', 'function classTarget() {}', {
        prototype: {},
      }),
    ).toEqual(true);
  });

  it('detects downleveled named classes using this', () => {
    expect(
      guessClass(
        'Target',
        'function Target() { this.value = true; }',
        {
          prototype: {},
        },
      ),
    ).toEqual(true);
  });

  it('detects functions without a standard function declaration', () => {
    const test = () => undefined;
    (test as any).prototype = {};

    expect(checkIsFunc(test)).toEqual(true);
  });
});
