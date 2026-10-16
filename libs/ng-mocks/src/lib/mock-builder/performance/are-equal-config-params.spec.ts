import areEqualConfigParams from './are-equal-config-params';

describe('are-equal-config-params', () => {
  it('rejects changed shallow behavior', () => {
    expect(
      areEqualConfigParams({ shallow: true }, { shallow: false }),
    ).toBe(false);
    expect(areEqualConfigParams({}, { shallow: false })).toBe(false);
  });

  it('rejects changed root placement', () => {
    expect(
      areEqualConfigParams({ onRoot: true }, { onRoot: false }),
    ).toBe(false);
  });

  it('rejects changed mock identity policy', () => {
    expect(
      areEqualConfigParams({ precise: true }, { precise: false }),
    ).toBe(false);
  });

  it('reuses equal behavior flags', () => {
    expect(
      areEqualConfigParams(
        {
          dependency: true,
          export: false,
          exportAll: false,
          shallow: true,
          onRoot: false,
          precise: true,
        },
        {
          dependency: true,
          export: false,
          exportAll: false,
          shallow: true,
          onRoot: false,
          precise: true,
        },
      ),
    ).toBe(true);
  });
});
