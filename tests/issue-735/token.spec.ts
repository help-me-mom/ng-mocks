import { Component, Inject, LOCALE_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-735-token',
  template: '{{ locale }}',
})
class TargetComponent {
  public constructor(
    @Inject(LOCALE_ID) public readonly locale: string,
  ) {}
}

// @see https://github.com/help-me-mom/ng-mocks/issues/735
describe('issue-735:token', () => {
  describe('ngMocks.defaultMock', () => {
    beforeAll(() => ngMocks.globalMock(LOCALE_ID));
    beforeAll(() => ngMocks.defaultMock(LOCALE_ID, () => 'de-DE'));

    afterAll(() => ngMocks.defaultMock(LOCALE_ID));
    afterAll(() => ngMocks.globalWipe(LOCALE_ID));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent));

      it('uses default mock correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.locale).toEqual('de-DE');
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
        expect(point.componentInstance.locale).toEqual('de-DE');
      });
    });
  });

  describe('ngMocks.defaultKeep', () => {
    beforeAll(() => ngMocks.globalKeep(LOCALE_ID));
    beforeAll(() => ngMocks.defaultMock(LOCALE_ID, () => 'de-DE'));

    afterAll(() => ngMocks.defaultMock(LOCALE_ID));
    afterAll(() => ngMocks.globalWipe(LOCALE_ID));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent));

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.locale).toEqual('en-US');
      });
    });

    describe('MockBuilder:mock', () => {
      beforeEach(() =>
        MockBuilder(TargetComponent).mock(LOCALE_ID, 'ru-RU'),
      );

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.locale).toEqual('ru-RU');
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
        expect(point.componentInstance.locale).toEqual('en-US');
      });
    });
  });
});
