import { NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder } from 'ng-mocks';

@NgModule({
  providers: [
    {
      provide: 'STRING',
      useValue: 'TOKEN',
    },
  ],
})
class TargetModule {}

// @see https://github.com/ike18t/ng-mocks/issues/762
describe('issue-762:string', () => {
  describe('as keep single lonely', () => {
    beforeEach(() => MockBuilder('STRING'));

    it('works correctly', () => {
      expect(() => TestBed.get('STRING')).toThrowError(
        /No provider for STRING/,
      );
    });
  });

  describe('as keep single', () => {
    beforeEach(() => MockBuilder('STRING', TargetModule));

    it('works correctly', () => {
      const token = TestBed.get('STRING');
      expect(token).toEqual('TOKEN');
    });
  });

  describe('as keep multi', () => {
    beforeEach(() => MockBuilder(['STRING'], TargetModule));

    it('works correctly', () => {
      const token = TestBed.get('STRING');
      expect(token).toEqual('TOKEN');
    });
  });

  describe('as mock single lonely', () => {
    beforeEach(() => MockBuilder(null, 'STRING'));

    it('works correctly', () => {
      const token = TestBed.get('STRING');
      expect(token).toEqual(undefined);
    });
  });

  describe('as mock single', () => {
    beforeEach(() => MockBuilder(TargetModule, 'STRING'));

    it('works correctly', () => {
      const token = TestBed.get('STRING');
      expect(token).toEqual(undefined);
    });
  });

  describe('as mock multi', () => {
    beforeEach(() => MockBuilder(TargetModule, ['STRING']));

    it('works correctly', () => {
      const token = TestBed.get('STRING');
      expect(token).toEqual(undefined);
    });
  });
});
