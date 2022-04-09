import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target1',
  template: '{{ name }}',
})
class Target1Component {
  public readonly name = 'target1';
}

@Component({
  selector: 'target2',
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
        MockRender('<target2></target2>').nativeElement.innerHTML,
      ).toContain('<target2></target2>');
      ngMocks.flushTestBed();
      expect(
        MockRender('<target1></target1>').nativeElement.innerHTML,
      ).toContain('<target1>target1</target1>');
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
        MockRender('<target2></target2>').nativeElement.innerHTML,
      ).toContain('<target2>target2</target2>');
      ngMocks.flushTestBed();
      expect(
        MockRender('<target1></target1>').nativeElement.innerHTML,
      ).toContain('<target1>target1</target1>');
    });
  });
});
