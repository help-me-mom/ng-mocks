import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target1-ng-mocks-global-keep',
  template: '{{ name }}',
})
class Target1Component {
  public readonly name = 'target1';
}

@Component({
  selector: 'target2-ng-mocks-global-keep',
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

describe('ng-mocks-global-keep:override', () => {
  afterAll(() => {
    ngMocks.globalWipe(Target1Component);
    ngMocks.globalWipe(Target2Component);
  });

  describe('keeping Target1Component', () => {
    beforeEach(async () => {
      ngMocks.globalKeep(Target1Component);

      return TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }).compileComponents();
    });

    it('renders Target1Component', () => {
      expect(
        MockRender(
          '<target2-ng-mocks-global-keep></target2-ng-mocks-global-keep>',
        ).nativeElement.innerHTML,
      ).toContain(
        '<target2-ng-mocks-global-keep></target2-ng-mocks-global-keep>',
      );
      ngMocks.flushTestBed();
      expect(
        MockRender(
          '<target1-ng-mocks-global-keep></target1-ng-mocks-global-keep>',
        ).nativeElement.innerHTML,
      ).toContain(
        '<target1-ng-mocks-global-keep>target1</target1-ng-mocks-global-keep>',
      );
    });
  });

  describe('keeping Target2Component', () => {
    beforeEach(async () => {
      ngMocks.globalKeep(Target2Component);

      return TestBed.configureTestingModule({
        imports: [MockModule(TargetModule)],
      }).compileComponents();
    });

    it('renders Target2Component too', () => {
      expect(
        MockRender(
          '<target2-ng-mocks-global-keep></target2-ng-mocks-global-keep>',
        ).nativeElement.innerHTML,
      ).toContain(
        '<target2-ng-mocks-global-keep>target2</target2-ng-mocks-global-keep>',
      );
      ngMocks.flushTestBed();
      expect(
        MockRender(
          '<target1-ng-mocks-global-keep></target1-ng-mocks-global-keep>',
        ).nativeElement.innerHTML,
      ).toContain(
        '<target1-ng-mocks-global-keep>target1</target1-ng-mocks-global-keep>',
      );
    });
  });
});
