import areEqualProviders from './are-equal-providers';

describe('are-equal-providers', () => {
  it('distinguishes a class provider from an explicit class recipe', () => {
    class Target {}

    expect(
      areEqualProviders(Target, {
        provide: Target,
        useClass: Target,
      }),
    ).toBe(false);
    expect(
      areEqualProviders(
        { provide: Target, useClass: Target },
        Target,
      ),
    ).toBe(false);
    expect(areEqualProviders([Target], [Target])).toBe(true);
  });

  it('rejects a changed token in a module provider list', () => {
    expect(
      areEqualProviders(
        [{ provide: 'first', useValue: 'value' }],
        [{ provide: 'second', useValue: 'value' }],
      ),
    ).toBe(false);
  });

  it('rejects changed factory dependencies', () => {
    const useFactory = (value: string) => value;

    expect(
      areEqualProviders(
        { provide: 'target', useFactory, deps: ['first'] },
        { provide: 'target', useFactory, deps: ['second'] },
      ),
    ).toBe(false);
  });

  it('rejects changed class dependencies', () => {
    class Target {}

    expect(
      areEqualProviders(
        { provide: 'target', useClass: Target, deps: [] },
        { provide: 'target', useClass: Target, deps: ['dependency'] },
      ),
    ).toBe(false);
  });

  it('distinguishes inferred dependencies from an explicit empty list', () => {
    class Target {}

    expect(
      areEqualProviders(
        { provide: 'target', useClass: Target },
        { provide: 'target', useClass: Target, deps: [] },
      ),
    ).toBe(false);
  });

  it('reuses equal factory dependencies in a new array', () => {
    const useFactory = (value: string) => value;

    expect(
      areEqualProviders(
        { provide: 'target', useFactory, deps: ['dependency'] },
        { provide: 'target', useFactory, deps: ['dependency'] },
      ),
    ).toBe(true);
  });

  it('reuses falsy value recipes', () => {
    for (const useValue of [false, 0, '', null, undefined]) {
      expect(
        areEqualProviders(
          { provide: 'target', useValue },
          { provide: 'target', useValue },
        ),
      ).toBe(true);
    }
  });

  it('distinguishes an undefined value recipe from a missing recipe', () => {
    expect(
      areEqualProviders(
        { provide: 'target', useValue: undefined },
        { provide: 'target' },
      ),
    ).toBe(false);
  });
});
