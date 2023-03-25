import { DatePipe } from '@angular/common';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-735-date-pipe',
  template: '{{ stamp | date }}',
})
class TargetComponent {
  public readonly stamp = '2021-05-01';
}

// Updates CommonModule on platform level based on the global setup.
// @see https://github.com/help-me-mom/ng-mocks/issues/735
describe('issue-735:date-pipe', () => {
  describe('ngMocks.defaultMock', () => {
    beforeAll(() => ngMocks.globalMock(DatePipe));
    beforeAll(() =>
      ngMocks.defaultMock(
        DatePipe,
        () =>
          ({
            transform: (value: string) => `MOCK:${value}`,
          } as never),
      ),
    );

    afterAll(() => ngMocks.defaultMock(DatePipe));
    afterAll(() => ngMocks.globalWipe(DatePipe));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent));

      it('mocks declarations from CommonModule', () => {
        const fixture = MockRender(TargetComponent);
        expect(ngMocks.formatText(fixture)).toEqual(
          'MOCK:2021-05-01',
        );
      });
    });

    describe('TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
        }).compileComponents(),
      );

      it('mocks declarations from CommonModule', () => {
        const fixture = MockRender(TargetComponent);
        expect(ngMocks.formatText(fixture)).toEqual(
          'MOCK:2021-05-01',
        );
      });
    });
  });

  describe('ngMocks.defaultKeep', () => {
    beforeAll(() => ngMocks.globalKeep(DatePipe));
    beforeAll(() =>
      ngMocks.defaultMock(
        DatePipe,
        () =>
          ({
            transform: (value: string) => `MOCK:${value}`,
          } as never),
      ),
    );

    afterAll(() => ngMocks.defaultMock(DatePipe));
    afterAll(() => ngMocks.globalWipe(DatePipe));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent));

      it('keeps declarations from CommonModule', () => {
        const fixture = MockRender(TargetComponent);
        expect(ngMocks.formatText(fixture)).toEqual('May 1, 2021');
      });
    });

    describe('TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
        }).compileComponents(),
      );

      it('keeps declarations from CommonModule', () => {
        const fixture = MockRender(TargetComponent);
        expect(ngMocks.formatText(fixture)).toEqual('May 1, 2021');
      });
    });
  });

  describe('ngMocks.defaultExclude', () => {
    beforeAll(() => ngMocks.globalExclude(DatePipe));
    beforeAll(() =>
      ngMocks.defaultMock(
        DatePipe,
        () =>
          ({
            transform: (value: string) => `MOCK:${value}`,
          } as never),
      ),
    );

    afterAll(() => ngMocks.defaultMock(DatePipe));
    afterAll(() => ngMocks.globalWipe(DatePipe));

    describe('MockBuilder', () => {
      it('excludes declarations from CommonModule', async () => {
        try {
          await MockBuilder(TargetComponent);
          MockRender(TargetComponent);
          fail('should not be here');
        } catch (error) {
          if (error instanceof Error) {
            expect(error.message).toMatch(
              /The pipe 'date' could not be found/,
            );
          } else {
            fail('should fail');
          }
        }
      });
    });

    describe('TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
        }),
      );

      it('excludes declarations from CommonModule', async () => {
        try {
          await TestBed.compileComponents();
          TestBed.createComponent(TargetComponent).detectChanges();
          fail('should not be here');
        } catch (error) {
          if (error instanceof Error) {
            expect(error.message).toMatch(
              /The pipe 'date' could not be found/,
            );
          } else {
            fail('should fail');
          }
        }
      });
    });
  });
});
