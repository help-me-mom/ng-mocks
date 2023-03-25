/* eslint-disable no-console */

import { Component, NgModule, SecurityContext } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-735',
  template: '{{ service }}',
})
class TargetComponent {
  public constructor(public readonly service: DomSanitizer) {}
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// @see https://github.com/help-me-mom/ng-mocks/issues/735
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
      let consoleLog: typeof console.log;
      beforeAll(() => (consoleLog = console.log));
      afterAll(() => (console.log = consoleLog));

      beforeEach(() => {
        console.log =
          typeof jest === 'undefined'
            ? jasmine.createSpy()
            : jest.fn();
      });

      beforeEach(() => MockBuilder(TargetComponent, TargetModule));

      it('uses default keep correctly', () => {
        const { point } = MockRender(TargetComponent);
        expect(() => {
          ngMocks.stubMember(
            console,
            'log',
            typeof jest === 'undefined'
              ? jasmine.createSpy().and.callFake(message => {
                  throw new Error(message);
                })
              : jest.fn(message => {
                  throw new Error(message);
                }),
          );
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
          ngMocks.stubMember(
            console,
            'log',
            typeof jest === 'undefined'
              ? jasmine.createSpy().and.callFake(message => {
                  throw new Error(message);
                })
              : jest.fn(message => {
                  throw new Error(message);
                }),
          );
          point.componentInstance.service.sanitize(
            SecurityContext.HTML,
            '<script></script><div>test</div>',
          );
        }).toThrowError(/sanitizing HTML stripped some content/);
      });
    });
  });
});
