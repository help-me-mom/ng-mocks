import { ngMocks } from 'ng-mocks';

describe('ng-mocks-find-instance', () => {
  it('fails on wrong types', () => {
    try {
      ngMocks.findInstance(123 as any);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        'Only classes or tokens are accepted',
      );
    }
  });
});
