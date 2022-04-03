import { InjectionToken, NgModule } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

const TOKEN = new InjectionToken('TOKEN');

@NgModule({
  providers: [
    {
      provide: TOKEN,
      useValue: 'TOKEN',
    },
  ],
})
class TargetModule {}

// @see https://github.com/ike18t/ng-mocks/issues/762
describe('issue-762:token', () => {
  describe('as keep single lonely', () => {
    beforeEach(() => MockBuilder(TOKEN));

    it('works correctly', () => {
      expect(() => MockRender(TOKEN)).toThrowError(
        /No provider for InjectionToken TOKEN/,
      );
    });
  });

  describe('as keep single', () => {
    beforeEach(() => MockBuilder(TOKEN, TargetModule));

    it('works correctly', () => {
      const fixture = MockRender(TOKEN);
      expect(fixture.point.componentInstance).toEqual('TOKEN');
    });
  });

  describe('as keep multi', () => {
    beforeEach(() => MockBuilder([TOKEN], TargetModule));

    it('works correctly', () => {
      const fixture = MockRender(TOKEN);
      expect(fixture.point.componentInstance).toEqual('TOKEN');
    });
  });

  describe('as mock single lonely', () => {
    beforeEach(() => MockBuilder(null, TOKEN));

    it('works correctly', () => {
      const fixture = MockRender(TOKEN);
      expect(fixture.point.componentInstance).toEqual(undefined);
    });
  });

  describe('as mock single', () => {
    beforeEach(() => MockBuilder(TargetModule, TOKEN));

    it('works correctly', () => {
      const fixture = MockRender(TOKEN);
      expect(fixture.point.componentInstance).toEqual(undefined);
    });
  });

  describe('as mock multi', () => {
    beforeEach(() => MockBuilder(TargetModule, [TOKEN]));

    it('works correctly', () => {
      const fixture = MockRender(TOKEN);
      expect(fixture.point.componentInstance).toEqual(undefined);
    });
  });
});
