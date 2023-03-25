import { Component, Testability } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-735-provider',
  template: '{{ service }}',
})
class TargetComponent {
  public constructor(public readonly service: Testability) {}
}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// @see https://github.com/help-me-mom/ng-mocks/issues/735
describe('issue-735:provider', () => {
  describe('ngMocks.defaultMock', () => {
    beforeAll(() => ngMocks.globalMock(Testability));
    beforeAll(() =>
      ngMocks.defaultMock(
        Testability,
        () =>
          ({
            mock1: true,
          } as never),
      ),
    );

    afterAll(() => ngMocks.defaultMock(Testability));
    afterAll(() => ngMocks.globalWipe(Testability));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent));

      it('uses default mock correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.service).toEqual(
          assertion.objectContaining({
            mock1: true,
          }),
        );
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
        expect(point.componentInstance.service).toEqual(
          assertion.objectContaining({
            mock1: true,
          }),
        );
      });
    });
  });

  describe('ngMocks.defaultKeep', () => {
    beforeAll(() => ngMocks.globalKeep(Testability));
    beforeAll(() =>
      ngMocks.defaultMock(
        Testability,
        () =>
          ({
            mock2: true,
          } as never),
      ),
    );

    afterAll(() => ngMocks.defaultMock(Testability));
    afterAll(() => ngMocks.globalWipe(Testability));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent));

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.service).not.toEqual(
          assertion.objectContaining({
            mock2: true,
          }),
        );
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
        expect(point.componentInstance.service).not.toEqual(
          assertion.objectContaining({
            mock2: true,
          }),
        );
      });
    });
  });

  // unfortunately doesn't work properly
  // describe('ngMocks.defaultExclude', () => {
  //   beforeAll(() => ngMocks.globalExclude(Testability));
  //   beforeAll(() =>
  //     ngMocks.defaultMock(
  //       Testability,
  //       () =>
  //         ({
  //           mock3: true,
  //         } as never),
  //     ),
  //   );
  //
  //   afterAll(() => ngMocks.defaultMock(Testability));
  //   afterAll(() => ngMocks.globalWipe(Testability));
  //
  //   describe('MockBuilder', () => {
  //     it('uses default exclude correctly', async () => {
  //       try {
  //         await MockBuilder(TargetComponent);
  //         MockRender(TargetComponent);
  //         fail('should not be here');
  //       } catch (e) {
  //         expect(e.message).toMatch(/test/);
  //       }
  //     });
  //   });
  //
  //   describe('TestBed', () => {
  //     beforeEach(() =>
  //       TestBed.configureTestingModule({
  //         declarations: [TargetComponent],
  //       }),
  //     );
  //
  //     it('uses default exclude correctly', async () => {
  //       try {
  //         await TestBed.compileComponents();
  //         TestBed.createComponent(TargetComponent).detectChanges();
  //         fail('should not be here');
  //       } catch (e) {
  //         expect(e.message).toMatch(/test/);
  //       }
  //     });
  //   });
  // });
});
