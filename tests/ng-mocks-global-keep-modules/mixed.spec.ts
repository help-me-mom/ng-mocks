import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockModule, ngMocks } from 'ng-mocks';

const calls: string[] = [];

@Component({
  selector: 'child-global-keep-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real child',
})
class ChildComponent {
  public constructor() {
    calls.push('child');
  }
}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
})
class ChildModule {}

@Component({
  selector: 'kept-global-keep-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    'kept <child-global-keep-mixed></child-global-keep-mixed>',
})
class KeptComponent {
  public constructor() {
    calls.push('kept');
  }
}

@NgModule({
  declarations: [KeptComponent],
  exports: [KeptComponent],
  imports: [ChildModule],
})
class KeptModule {}

@Component({
  selector: 'mocked-global-keep-mixed',
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
  exports: [MockedComponent],
})
class MockedModule {}

@Component({
  selector: 'host-global-keep-mixed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    host
    <kept-global-keep-mixed></kept-global-keep-mixed>
    <mocked-global-keep-mixed></mocked-global-keep-mixed>
  `,
})
class HostComponent {}

@NgModule({
  declarations: [HostComponent],
  imports: [KeptModule, MockedModule],
})
class HostModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14895
describe('ng-mocks-global-keep-modules:mixed', () => {
  beforeAll(() => {
    ngMocks.globalKeep(KeptModule);
    ngMocks.globalMock(ChildModule);
  });
  afterAll(() => {
    ngMocks.globalWipe(KeptModule);
    ngMocks.globalWipe(ChildModule);
  });

  beforeEach(() => {
    calls.length = 0;

    return TestBed.configureTestingModule({
      imports: [HostModule, MockModule(MockedModule)],
    });
  });

  it('keeps the module without overriding a global child-module mock or an explicit module mock', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    expect(
      isMockOf(
        ngMocks.findInstance(fixture, KeptComponent),
        KeptComponent,
      ),
    ).toBe(false);
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, ChildComponent),
        ChildComponent,
      ),
    ).toBe(true);
    expect(
      isMockOf(
        ngMocks.findInstance(fixture, MockedComponent),
        MockedComponent,
      ),
    ).toBe(true);
    expect(ngMocks.formatText(fixture)).toEqual('host kept');
    expect(calls).toEqual(['kept']);
  });
});
