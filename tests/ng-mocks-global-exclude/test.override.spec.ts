import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target1-ng-mocks-global-exclude',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: '{{ name }}',
})
class Target1Component {
  public readonly name = 'target1';
}

@Component({
  selector: 'target2-ng-mocks-global-exclude',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
  template: '{{ name }}',
})
class Target2Component {
  public readonly name = 'target2';
}

@NgModule({
  declarations: [Target1Component, Target2Component],
  exports: [Target1Component, Target2Component],
})
class TargetModule {}

describe('ng-mocks-global-exclude:override', () => {
  ngMocks.throwOnConsole();

  afterAll(() => {
    ngMocks.globalWipe(Target1Component);
    ngMocks.globalWipe(Target2Component);
  });

  describe('excluding Target1Component', () => {
    beforeEach(async () => {
      ngMocks.globalExclude(Target1Component);

      return TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }).compileComponents();
    });

    it('cannot find Target1Component', () => {
      expect(() =>
        MockRender(
          '<target2-ng-mocks-global-exclude></target2-ng-mocks-global-exclude>',
        ),
      ).not.toThrow();
      ngMocks.flushTestBed();
      try {
        MockRender(
          '<target1-ng-mocks-global-exclude></target1-ng-mocks-global-exclude>',
        );
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `'target1-ng-mocks-global-exclude' is not a known element`,
        );
      }
    });
  });

  describe('excluding Target2Component', () => {
    beforeEach(async () => {
      ngMocks.globalExclude(Target2Component);

      return TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }).compileComponents();
    });

    it('cannot find Target2Component too', () => {
      try {
        MockRender(
          '<target2-ng-mocks-global-exclude></target2-ng-mocks-global-exclude>',
        );
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          `'target2-ng-mocks-global-exclude' is not a known element`,
        );
      }
    });
  });
});
