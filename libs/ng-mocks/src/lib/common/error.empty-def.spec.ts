import errorEmptyDef from './error.empty-def';

describe('error.empty-def', () => {
  it('skips defined values', () => {
    expect(() => errorEmptyDef(true)).not.toThrow();
    expect(() => errorEmptyDef(class Test {})).not.toThrow();
    expect(() => errorEmptyDef(() => undefined)).not.toThrow();
  });

  it('throws on undefined values', () => {
    expect(() => errorEmptyDef(undefined)).toThrowError(
      /undefined \/ null has been passed into ng-mocks/,
    );
    expect(() => errorEmptyDef(null)).toThrowError(
      /undefined \/ null has been passed into ng-mocks/,
    );
  });
});
