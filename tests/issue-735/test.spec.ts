import { Component, NgModule, SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  template: '{{ service }}',
})
class TargetComponent {
  public constructor(public readonly service: DomSanitizer) {}
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

describe('issue-735', () => {
  // A5: log because of old angular
  ngMocks.throwOnConsole('log', 'warn', 'error');

  describe('ngMocks.defaultMock', () => {
    beforeAll(() => ngMocks.globalMock(DomSanitizer));
    beforeAll(() =>
      ngMocks.defaultMock(
        DomSanitizer,
        () =>
          ({
            mock1: true,
          } as never),
      ),
    );

    afterAll(() => ngMocks.defaultMock(DomSanitizer));
    afterAll(() => ngMocks.globalWipe(DomSanitizer));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent, TargetModule));

      it('uses default mock correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(point.componentInstance.service).toEqual(
          jasmine.objectContaining({
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
          jasmine.objectContaining({
            mock1: true,
          }),
        );
      });
    });
  });

  describe('ngMocks.defaultKeep', () => {
    beforeAll(() => ngMocks.globalKeep(DomSanitizer));
    beforeAll(() =>
      ngMocks.defaultMock(
        DomSanitizer,
        () =>
          ({
            mock2: true,
          } as never),
      ),
    );

    afterAll(() => ngMocks.defaultMock(DomSanitizer));
    afterAll(() => ngMocks.globalWipe(DomSanitizer));

    describe('MockBuilder', () => {
      beforeEach(() => MockBuilder(TargetComponent, TargetModule));

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(() => {
          spyOn(console, 'log').and.callFake(message => {
            throw new Error(message);
          });
          point.componentInstance.service.sanitize(
            SecurityContext.HTML,
            '<script></script><div>test</div>',
          );
        }).toThrowError(/sanitizing HTML stripped some content/);
      });
    });

    describe('TestBed', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
        }),
      );

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(() => {
          spyOn(console, 'log').and.callFake(message => {
            throw new Error(message);
          });
          point.componentInstance.service.sanitize(
            SecurityContext.HTML,
            '<script></script><div>test</div>',
          );
        }).toThrowError(/sanitizing HTML stripped some content/);
      });
    });
  });
});
