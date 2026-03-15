import { Component, Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
abstract class BaseComponent {
  public baseComponent8201() {}
}

@Component({
  selector: 'issue-8201-real',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real',
})
class RealComponent extends BaseComponent {
  public realComponent8201() {}
}

@Component({
  selector: 'issue-8201-real',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'fake',
})
class FakeComponent {
  public fakeComponent8201() {}
}

@Component({
  selector: 'issue-8201-target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<issue-8201-real></issue-8201-real>',
})
class TargetComponent {
  public targetComponent8201() {}
}

@NgModule({
  declarations: [RealComponent, TargetComponent],
})
class TargetModule {
  public targetModule8201() {}
}

describe('issue-8201', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).replace(
      RealComponent,
      FakeComponent,
    ),
  );

  it('allows replacing components that inherit an injectable base class', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.nativeElement.innerHTML).toContain('>fake<');
  });
});
