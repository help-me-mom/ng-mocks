import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockModule, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-global-exclude-modules',
  template: '{{ name }}',
})
class Target1Component {
  public readonly name = 'target1';
}

@NgModule({
  declarations: [Target1Component],
  exports: [Target1Component],
})
class Target1Module {}

ngMocks.globalExclude(Target1Module);

// The root module we pass into MockModule is not excluded despite the setting.
describe('ng-mocks-global-exclude-modules', () => {
  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [MockModule(Target1Module)],
    });
  });

  it('mocks Target1Component', () => {
    const fixture = MockRender(
      '<target-ng-mocks-global-exclude-modules></target-ng-mocks-global-exclude-modules>',
    );
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target-ng-mocks-global-exclude-modules></target-ng-mocks-global-exclude-modules>',
    );
  });
});
