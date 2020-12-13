import helperExtractPropertyDescriptor from './helper.extract-property-descriptor';

describe('helper.extract-property-descriptor', () => {
  it('returns undefined on null', () => {
    expect(
      helperExtractPropertyDescriptor(null, 'test'),
    ).toBeUndefined();
  });
});
