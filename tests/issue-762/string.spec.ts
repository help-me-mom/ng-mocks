import { NgModule } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

@NgModule({
  providers: [
    {
      provide: 'STRING',
      useValue: 'TOKEN',
    },
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/762
describe('issue-762:string', () => {
  describe('as keep single lonely', () => {
    beforeEach(() => MockBuilder('STRING'));

    it('works correctly', () => {
      expect(() => ngMocks.findInstance('STRING')).toThrowError(
        'Cannot find an instance via ngMocks.findInstance(STRING)',
      );
    });
  });

  describe('as keep single', () => {
    beforeEach(() => MockBuilder('STRING', TargetModule));

    it('works correctly', () => {
      const token = ngMocks.findInstance('STRING');
      expect(token).toEqual('TOKEN');
    });
  });

  describe('as keep multi', () => {
    beforeEach(() => MockBuilder(['STRING'], TargetModule));

    it('works correctly', () => {
      const token = ngMocks.findInstance('STRING');
      expect(token).toEqual('TOKEN');
    });
  });

  describe('as mock single lonely', () => {
    beforeEach(() => MockBuilder(null, 'STRING'));

    it('works correctly', () => {
      const token = ngMocks.findInstance('STRING');
      expect(token).toEqual(undefined);
    });
  });

  describe('as mock single', () => {
    beforeEach(() => MockBuilder(TargetModule, 'STRING'));

    it('works correctly', () => {
      const token = ngMocks.findInstance('STRING');
      expect(token).toEqual(undefined);
    });
  });

  describe('as mock multi', () => {
    beforeEach(() => MockBuilder(TargetModule, ['STRING']));

    it('works correctly', () => {
      const token = ngMocks.findInstance('STRING');
      expect(token).toEqual(undefined);
    });
  });
});
