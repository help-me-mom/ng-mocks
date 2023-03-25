import {
  Component,
  forwardRef,
  Inject,
  InjectionToken,
  NgModule,
  VERSION,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const TOKEN = new (InjectionToken as any)('TOKEN-FOR-ROOT', {
  factory: () => 'TOKEN',
  providedIn: 'root',
});

@Component({
  selector: 'target-735-token-for-root',
  template: '{{ token }}',
})
class TargetComponent {
  public constructor(
    @Inject(forwardRef(() => TOKEN)) public readonly token: string,
  ) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/735
describe('issue-735:token-for-root', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('ngMocks.defaultMock', () => {
    beforeAll(() => ngMocks.globalMock(TOKEN));
    beforeAll(() => ngMocks.defaultMock(TOKEN, () => 'MOCK1'));

    afterAll(() => ngMocks.defaultMock(TOKEN));
    afterAll(() => ngMocks.globalWipe(TOKEN));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetModule));

      it('uses default mock correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.token).toEqual('MOCK1');
      });
    });

    describe('TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
        }).compileComponents(),
      );

      it('uses default mock correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.token).toEqual('MOCK1');
      });
    });
  });

  describe('ngMocks.defaultKeep', () => {
    beforeAll(() => ngMocks.globalKeep(TOKEN));
    beforeAll(() => ngMocks.defaultMock(TOKEN, () => 'MOCK2'));

    afterAll(() => ngMocks.defaultMock(TOKEN));
    afterAll(() => ngMocks.globalWipe(TOKEN));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent));

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.token).toEqual('TOKEN');
      });
    });

    describe('MockBuilder:mock', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent).mock(TOKEN, 'MOCK3'),
      );

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.token).toEqual('MOCK3');
      });
    });

    describe('TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
        }).compileComponents(),
      );

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.token).toEqual('TOKEN');
      });
    });
  });
});
