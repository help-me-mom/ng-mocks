import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-global-replace-modules',
  template: '{{ name }}',
})
class Target1Component {
  public readonly name = 'target1';

  public target1() {
    return true;
  }
}

@NgModule({
  declarations: [Target1Component],
  exports: [Target1Component],
})
class Target1Module {}

@Component({
  selector: 'target-ng-mocks-global-replace-modules',
  template: '{{ name }}',
})
class Target2Component {
  public readonly name = 'target2';

  public target2() {
    return true;
  }
}

@NgModule({
  declarations: [Target2Component],
  exports: [Target2Component],
})
class Target2Module {}

@NgModule({
  exports: [Target1Module],
  imports: [Target1Module],
})
class Target3Module {}

ngMocks.globalReplace(Target1Module, Target2Module);

describe('ng-mocks-global-replace-modules', () => {
  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [MockModule(Target3Module)],
    });
  });

  it('replaces Target1Module with Target2Module', () => {
    const fixture = MockRender(
      '<target-ng-mocks-global-replace-modules></target-ng-mocks-global-replace-modules>',
    );
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target-ng-mocks-global-replace-modules>target2</target-ng-mocks-global-replace-modules>',
    );
  });
});
