import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MockBuilder, MockInstance, MockRender, MockReset } from 'ng-mocks';
import { Observable, Subject } from 'rxjs';

// A child component that contains update$ the parent component wants to listen to.
@Component({
  selector: 'target',
  template: '{{ update$ | async }}',
})
export class TargetComponent {
  public update$: Observable<void>;

  constructor() {
    const subject = new Subject<void>();
    this.update$ = subject;
    subject.complete();
  }
}

// A parent component that uses @ViewChild to listen to update$ of its child component.
@Component({
  selector: 'real',
  template: '<target></target>',
})
export class RealComponent implements AfterViewInit {
  @ViewChild(TargetComponent, {
    static: false,
  } as any)
  public child: TargetComponent;

  ngAfterViewInit() {
    this.child.update$.subscribe();
  }
}

describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be mocked.
  beforeEach(() => MockBuilder(RealComponent).mock(TargetComponent));

  beforeEach(() => {
    // Because TargetComponent is mocked its update$ is undefined and
    // ngAfterViewInit of the parent component will fail on .subscribe().
    // Let's fix it via defining custom initialization of the mock.
    MockInstance(TargetComponent, {
      init: (instance, injector) => {
        const subject = new Subject<void>();
        subject.complete();
        instance.update$ = subject; // comment this line to check the failure.
        // if you want you can use injector.get(Service) for a more complicated initialization.
      },
    });
  });

  // Don't forget to reset MockInstance back.
  afterEach(MockReset);

  it('should render', () => {
    // Without the custom initialization rendering would fail here with
    // "Cannot read property 'subscribe' of undefined"
    const fixture = MockRender(RealComponent);

    // Let's check that the mocked component has been decorated by the custom initialization.
    expect(fixture.point.componentInstance.child.update$).toBeDefined();
  });
});
