import funcIsJestMock from './func.is-jest-mock';

describe('func.is-jest-mock', () => {
  it('skips undefined', () => {
    expect(funcIsJestMock(undefined)).toEqual(false);
  });

  it('skips null', () => {
    expect(funcIsJestMock(null)).toEqual(false);
  });

  it('skips primitives', () => {
    expect(funcIsJestMock(true)).toEqual(false);
    expect(funcIsJestMock(0)).toEqual(false);
    expect(funcIsJestMock('')).toEqual(false);
  });

  it('handles functions', () => {
    const test = () => undefined;
    expect(funcIsJestMock(test)).toEqual(false);

    test._isMockFunction = true;
    test.mockName = () => test;
    test.__annotations__ = [] as never[];
    expect(funcIsJestMock(test)).toEqual(true);
  });

  it('handles objects', () => {
    const test: Record<keyof any, any> = {};
    expect(funcIsJestMock(test)).toEqual(false);

    test._isMockFunction = true;
    test.mockName = () => test;
    test.__annotations__ = [] as never[];
    expect(funcIsJestMock(test)).toEqual(true);
  });
});
