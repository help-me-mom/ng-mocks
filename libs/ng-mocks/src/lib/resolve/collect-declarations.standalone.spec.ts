import coreDefineProperty from '../common/core.define-property';
import funcGetGlobal from '../common/func.get-global';
import { isStandalone } from '../common/func.is-standalone';

import collectDeclarations from './collect-declarations';

describe('collect-declarations:standalone', () => {
  let reflectionOverride: PropertyDescriptor | undefined;

  beforeEach(() => {
    reflectionOverride = Object.getOwnPropertyDescriptor(
      funcGetGlobal(),
      '__ngMocksReflectComponentType',
    );
    coreDefineProperty(
      funcGetGlobal(),
      '__ngMocksReflectComponentType',
      false,
    );
  });

  afterEach(() => {
    if (reflectionOverride) {
      Object.defineProperty(
        funcGetGlobal(),
        '__ngMocksReflectComponentType',
        reflectionOverride,
      );
    } else {
      delete funcGetGlobal().__ngMocksReflectComponentType;
    }
  });

  for (const [ngMetadataName, property] of [
    ['Component', 'ɵcmp'],
    ['Directive', 'ɵdir'],
    ['Pipe', 'ɵpipe'],
  ]) {
    for (const standalone of [true, false]) {
      it(`uses compiled ${ngMetadataName} standalone:${standalone} when its annotation omits the flag`, () => {
        class Target {}

        const annotation = Object.freeze({ ngMetadataName });
        const annotations = Object.freeze([annotation]);
        const definition = Object.freeze({ standalone });
        coreDefineProperty(Target, '__annotations__', annotations);
        coreDefineProperty(Target, property, definition);

        const actual = collectDeclarations(Target);

        expect(actual.standalone).toBe(standalone);
        expect(actual[ngMetadataName].standalone).toBe(standalone);
        expect(isStandalone(Target)).toBe(standalone);
        expect(collectDeclarations(Target)).toBe(actual);
        expect(actual[ngMetadataName]).not.toBe(annotation);
        expect(annotation).toEqual({ ngMetadataName });
        expect(definition).toEqual({ standalone });
        expect(
          Object.getOwnPropertyDescriptor(Target, '__annotations__')
            ?.value,
        ).toBe(annotations);
        expect(
          Object.getOwnPropertyDescriptor(Target, property)?.value,
        ).toBe(definition);
      });
    }
  }
});
