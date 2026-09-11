import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule, ngMocks } from 'ng-mocks';

const calls: string[] = [];

@Component({
  selector: 'child-global-exclude-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'excluded child',
})
class ExcludedChildComponent {
  public constructor() {
    calls.push('excluded child');
  }
}

@NgModule({
  declarations: [ExcludedChildComponent],
  exports: [ExcludedChildComponent],
})
class SharedModule {}

@Component({
  selector: 'excluded-global-exclude-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '<child-global-exclude-mixed></child-global-exclude-mixed>',
})
class ExcludedComponent {
  public constructor() {
    calls.push('excluded');
  }
}

@NgModule({
  declarations: [ExcludedComponent],
  exports: [ExcludedComponent],
  imports: [SharedModule],
})
class ExcludedModule {}

@Component({
  selector: 'mocked-global-exclude-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real mocked',
})
class MockedComponent {
  public constructor() {
    calls.push('mocked');
  }
}

@NgModule({
  declarations: [MockedComponent],
  exports: [MockedComponent, SharedModule],
  imports: [SharedModule],
})
class MockedModule {}

@Component({
  selector: 'host-global-exclude-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    host
    <excluded-global-exclude-mixed></excluded-global-exclude-mixed>
    <child-global-exclude-mixed></child-global-exclude-mixed>
    <mocked-global-exclude-mixed></mocked-global-exclude-mixed>
  `,
})
class HostComponent {}

@NgModule({
  declarations: [HostComponent],
  imports: [ExcludedModule, MockedModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class HostModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14895
describe('ng-mocks-global-exclude-modules:mixed', () => {
  beforeAll(() => ngMocks.globalExclude(ExcludedModule));
  afterAll(() => ngMocks.globalWipe(ExcludedModule));

  beforeEach(() => {
    calls.length = 0;

    return TestBed.configureTestingModule({
      imports: [HostModule, MockModule(MockedModule)],
    });
  });

  it('excludes the module without keeping its shared descendant real through a mock', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      ngMocks.findInstance(fixture, ExcludedComponent, null),
    ).toBeNull();
    // The excluded path must not infer a keep for a child that is still
    // rendered through the explicitly mocked module.
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ExcludedChildComponent),
        ExcludedChildComponent,
      ),
    ).toBe(true);
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, MockedComponent),
        MockedComponent,
      ),
    ).toBe(true);
    expect(ngMocks.formatText(fixture)).toEqual('host');
    expect(calls).toEqual([]);
  });
});
