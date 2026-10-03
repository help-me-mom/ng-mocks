import { Sanitizer } from '@angular/core';

import coreDefineProperty from '../common/core.define-property';

import checkIsFunc, { guessClass } from './check.is-func';

describe('check.is-func', () => {
  // @see https://github.com/help-me-mom/ng-mocks/issues/15005
  it('recognizes an Angular abstract class even with an empty ES5 constructor', () => {
    const definition = Object.getOwnPropertyDescriptor(
      Sanitizer,
      'ɵprov',
    )!;
    coreDefineProperty(Sanitizer, 'ɵprov', undefined);
    const constructor: { toString: () => string } = Sanitizer;
    spyOn(constructor, 'toString').and.returnValue(
      'function Sanitizer() {}',
    );

    try {
      expect(Object.keys(Sanitizer.prototype)).toEqual([]);
      expect(checkIsFunc(Sanitizer)).toBe(false);
    } finally {
      Object.defineProperty(Sanitizer, 'ɵprov', definition);
    }
  });

  it('keeps a same-named application function subject to ordinary classification', () => {
    let calls = 0;
    const application = () => {
      calls += 1;
    };
    coreDefineProperty(application, 'name', 'Sanitizer');

    expect(application.name).toBe('Sanitizer');
    expect(checkIsFunc(application)).toBe(true);
    expect(calls).toBe(0);
  });

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

  it('detects downleveled classes with only a symbol prototype method', () => {
    const member = Symbol('method');
    const method = jasmine.createSpy('original method');
    const prototype = { [member]: method };

    expect(Object.keys(prototype)).toEqual([]);
    expect(Object.getOwnPropertySymbols(prototype)).toEqual([member]);
    expect(
      guessClass('Target', 'function Target() {}', { prototype }),
    ).toBe(true);
    expect(method).not.toHaveBeenCalled();
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
