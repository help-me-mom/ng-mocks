import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule, ngMocks } from 'ng-mocks';

const calls: string[] = [];

@Component({
  selector: 'original-child-global-replace-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original child',
})
class OriginalChildComponent {
  public constructor() {
    calls.push('original child');
  }
}

@NgModule({
  declarations: [OriginalChildComponent],
  exports: [OriginalChildComponent],
})
class SharedModule {}

@Component({
  selector: 'target-global-replace-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '<original-child-global-replace-mixed></original-child-global-replace-mixed>',
})
class OriginalComponent {
  public constructor() {
    calls.push('original');
  }
}

@NgModule({
  declarations: [OriginalComponent],
  exports: [OriginalComponent],
  imports: [SharedModule],
})
class OriginalModule {}

@Component({
  selector: 'replacement-child-global-replace-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'replacement child',
})
class ReplacementChildComponent {
  public constructor() {
    calls.push('replacement child');
  }
}

@Component({
  selector: 'target-global-replace-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  // The replacement shares a selector but needs a distinct Angular component ID.
  host: { 'data-replacement': 'true' },
  template:
    '<replacement-child-global-replace-mixed></replacement-child-global-replace-mixed>',
})
class ReplacementComponent {
  public constructor() {
    calls.push('replacement');
  }
}

@NgModule({
  declarations: [ReplacementComponent, ReplacementChildComponent],
  exports: [ReplacementComponent],
})
class ReplacementModule {}

@Component({
  selector: 'mocked-global-replace-mixed',
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
  selector: 'host-global-replace-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    host
    <target-global-replace-mixed></target-global-replace-mixed>
    <original-child-global-replace-mixed></original-child-global-replace-mixed>
    <mocked-global-replace-mixed></mocked-global-replace-mixed>
  `,
})
class HostComponent {}

@NgModule({
  declarations: [HostComponent],
  imports: [OriginalModule, MockedModule],
})
class HostModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14895
describe('ng-mocks-global-replace-modules:mixed', () => {
  beforeAll(() =>
    ngMocks.globalReplace(OriginalModule, ReplacementModule),
  );
  afterAll(() => ngMocks.globalWipe(OriginalModule));

  beforeEach(() => {
    calls.length = 0;

    return TestBed.configureTestingModule({
      imports: [HostModule, MockModule(MockedModule)],
    });
  });

  it('replaces the real import graph without restoring original descendants', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ReplacementComponent),
        ReplacementComponent,
      ),
    ).toBe(false);
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ReplacementChildComponent),
        ReplacementChildComponent,
      ),
    ).toBe(false);
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, MockedComponent),
        MockedComponent,
      ),
    ).toBe(true);
    expect(
      ngMocks.findInstance(fixture, OriginalComponent, null),
    ).toBeNull();
    // Traversing the replaced module must not keep this shared child real
    // when it is also reachable through the explicitly mocked module.
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, OriginalChildComponent),
        OriginalChildComponent,
      ),
    ).toBe(true);
    expect(ngMocks.formatText(fixture)).toEqual(
      'host replacement child',
    );
    expect(calls).toEqual(['replacement', 'replacement child']);
  });
});
