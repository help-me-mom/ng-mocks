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
      guessClass('class_1', 'function class_1() {}', {
        prototype: {},
      }),
    ).toEqual(true);
  });

  it('detects functions with a class prefix', () => {
    const classify = () => undefined;
    (classify as any).prototype = {};
    classify.toString = () => 'function classify() {}';

    expect(checkIsFunc(classify)).toEqual(true);
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

  it('detects downleveled classes with regexp characters', () => {
    const target$ = () => undefined;
    (target$ as any).prototype = {};
    target$.toString = () =>
      'function target$() { classCallCheck(this, target$); }';

    expect(checkIsFunc(target$)).toEqual(false);
  });
});
