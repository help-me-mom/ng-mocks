import { ngMocks } from 'ng-mocks';

describe('ng-mocks-find-instances', () => {
  it('fails on wrong types', () => {
    expect(() => ngMocks.findInstances(123 as any)).toThrowError(
      'Only classes or tokens are accepted',
    );
  });
});
