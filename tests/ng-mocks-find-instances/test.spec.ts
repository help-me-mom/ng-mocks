import { ngMocks } from 'ng-mocks';

describe('ng-mocks-find-instances', () => {
  it('fails on wrong types', () => {
    try {
      ngMocks.findInstances(123 as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Only classes or tokens are accepted',
      );
    }
  });
});
