import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MockBuilder, MockInstance, MockRender, MockReset, ngMocks } from 'ng-mocks';
import { Observable, Subject } from 'rxjs';

// A child component that contains update$ the parent component wants to listen to.
@Component({
  selector: 'target',
  template: '{{ update$ | async }}',
})
class ChildComponent {
  public readonly update$: Observable<void>;

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
class RealComponent implements AfterViewInit {
  @ViewChild(ChildComponent, {
    static: false,
  } as any)
  protected child: ChildComponent;

  ngAfterViewInit() {
    this.child.update$.subscribe();
  }
}

describe('MockInstance', () => {
  // A normal setup of the TestBed, TargetComponent will be replaced
  // with its mock copy.
  beforeEach(() => MockBuilder(RealComponent).mock(ChildComponent));

  beforeAll(() => {
    // Because TargetComponent is replaced with its mock copy,
    // its update$ is undefined and ngAfterViewInit of the parent
    // component will fail on .subscribe().
    // Let's fix it via defining customization for the mock copy.
    MockInstance(ChildComponent, (instance, injector) => {
      const subject = new Subject<void>();
      subject.complete();
      ngMocks.stub(instance, {
        // comment the next line to check the failure.
        update$: subject,
      });
      // if you want you can use injector.get(Service) for more
      // complicated customization.
    });
  });

  // Do not forget to reset MockInstance back.
  afterAll(MockReset);

  it('should render', () => {
    // Without the custom initialization rendering would fail here
    // with "Cannot read property 'subscribe' of undefined".
    expect(() => MockRender(RealComponent)).not.toThrowError(/Cannot read property 'subscribe' of undefined/);
  });
});
