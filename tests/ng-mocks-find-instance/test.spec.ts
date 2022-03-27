import { ngMocks } from 'ng-mocks';

describe('ng-mocks-find-instance', () => {
  it('fails on wrong types', () => {
    expect(() => ngMocks.findInstance(123 as any)).toThrowError(
      'Only classes or tokens are accepted',
    );
  });
});
