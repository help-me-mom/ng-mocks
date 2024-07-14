import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Injector,
  NgModule,
  ViewChild,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';

// A copy of EMPTY, which does not exist in A5.
const EMPTY = new Subject<any>();
EMPTY.complete();

// A child component that contains update$ the parent component wants to listen to.
@Component({
  selector: 'child',
  template: '{{ update$ | async }}',
})
class ChildComponent {
  public readonly update$: Observable<void> = EMPTY;

  public constructor(public readonly injector: Injector) {}

  public childMockInstance() {}
}

// A parent component that uses @ViewChild to listen to update$ of its child component.
@Component({
  selector: 'target',
  template: '<child></child>',
})
class TargetComponent implements AfterViewInit {
  @ViewChild(ChildComponent, {} as never)
  protected child?: ChildComponent;

  public ngAfterViewInit() {
    if (this.child) {
      this.child.update$.subscribe();
    }
  }

  public targetMockInstance() {}
}

@NgModule({
  imports: [CommonModule],
  declarations: [TargetComponent, ChildComponent],
})
class ItsModule {}

describe('MockInstance', () => {
  // Creates a scope to reset customizations automatically after this test.
  MockInstance.scope();

  // A normal setup of the TestBed, ChildComponent will be replaced
  // with its mock object.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetComponent, ItsModule));

  beforeEach(() => {
    // Because ChildComponent is replaced with its mock object,
    // its update$ is undefined and ngAfterViewInit of the parent
    // component will fail on .subscribe().
    // Let's fix it via defining customization for the mock object.
    MockInstance(ChildComponent, () => ({
      // comment the next line to check the failure.
      update$: EMPTY,
    }));
  });

  it('should render', () => {
    // Without the custom initialization rendering would fail here
    // with "Cannot read property 'subscribe' of undefined".
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});
