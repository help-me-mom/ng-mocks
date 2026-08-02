import {
  Component,
  Injectable,
  NgModule,
  OnDestroy,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

let destroyCalls = 0;

@Injectable({ providedIn: 'root' })
class Issue5437Service implements OnDestroy {
  public ngOnDestroy(): void {
    destroyCalls += 1;
  }
}

@Component({
  selector: 'issue-5437-target',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class Issue5437TargetComponent {
  public constructor(public readonly service: Issue5437Service) {}
}

@NgModule({
  declarations: [Issue5437TargetComponent],
})
class Issue5437Module {}

// @see https://github.com/help-me-mom/ng-mocks/issues/5437
// ngMocks.faster used to discard the TestBed module reference without destroying
// its injector, so kept providers never received ngOnDestroy between tests.
describe('issue-5437', () => {
  ngMocks.faster();

  beforeEach(() =>
    MockBuilder(Issue5437TargetComponent, Issue5437Module).keep(
      Issue5437Service,
    ),
  );

  it('creates the kept service', () => {
    const fixture = MockRender(Issue5437TargetComponent);

    expect(fixture.point.componentInstance.service).toBeTruthy();
    expect(destroyCalls).toBe(0);
  });

  it('destroys the kept service after the previous test', () => {
    expect(destroyCalls).toBe(1);

    const fixture = MockRender(Issue5437TargetComponent);
    expect(fixture.point.componentInstance.service).toBeTruthy();
  });
});
