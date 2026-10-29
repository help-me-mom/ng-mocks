import coreDefineProperty from './core.define-property';
import createMetadataMatcher from './func.match-metadata-removals';

// Angular 5–6 do not export MetadataOverrider. These root-only cases exercise
// that unavailable dependency; public module regressions also run on real 5–6.
describe('match-metadata-removals:legacy', () => {
  it('matches object structures while preserving function identities', () => {
    class Dependency {}
    class OtherDependency {}
    const original = {
      ngModule: Dependency,
      providers: [{ provide: Dependency, useValue: 0 }],
    };
    const other = {
      ngModule: OtherDependency,
      providers: [{ provide: Dependency, useValue: 0 }],
    };
    const match = createMetadataMatcher();

    expect(
      match(
        [original, other],
        [
          {
            ngModule: Dependency,
            providers: [{ provide: Dependency, useValue: 0 }],
          },
        ],
      ),
    ).toEqual([original]);
  });

  it('compares nested arrays as whole entries and retains falsy values', () => {
    class Dependency {}
    const nested = [Dependency];
    const match = createMetadataMatcher();

    expect(match([nested], [Dependency])).toEqual([]);
    expect(
      match(
        [nested, 0, false, undefined],
        [[Dependency], 0, false, undefined],
      ),
    ).toEqual([nested, 0, false, undefined]);
  });

  it('uses legacy structural equality for repeated objects', () => {
    const shared = { value: 0 };
    const original = { first: shared, second: shared };
    const match = createMetadataMatcher();

    expect(
      match(
        [original],
        [{ first: { value: 0 }, second: { value: 0 } }],
      ),
    ).toEqual([original]);
  });

  it('supports Angular legacy function names without merging different references', () => {
    const first = () => undefined;
    const second = () => undefined;
    coreDefineProperty(first, 'name', '');
    coreDefineProperty(second, 'overriddenName', 'custom');
    const match = createMetadataMatcher();

    expect(match([first, second], [first, second])).toEqual([
      first,
      second,
    ]);
    expect(match([first], [second])).toEqual([]);
  });
});
