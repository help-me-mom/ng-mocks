import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Injector,
  ViewChild,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { MockComponent, MockInstance } from 'ng-mocks';

// A copy of EMPTY, which does not exist in A5.
const EMPTY = new Subject<any>();
EMPTY.complete();

// A child component that contains update$ the parent component wants to listen to.
@Component({
  selector: 'target-mock-instance',
  template: '{{ update$ | async }}',
})
class ChildComponent {
  public readonly update$: Observable<void> = EMPTY;

  public constructor(public readonly injector: Injector) {}
}

// A parent component that uses @ViewChild to listen to update$ of its child component.
@Component({
  selector: 'real',
  template: '<target-mock-instance></target-mock-instance>',
})
class RealComponent implements AfterViewInit {
  @ViewChild(ChildComponent, {} as any)
  protected child?: ChildComponent;

  public ngAfterViewInit() {
    if (this.child) {
      this.child.update$.subscribe();
    }
  }
}

describe('MockInstance:component', () => {
  // Creates a scope to reset customizations automatically after this test.
  MockInstance.scope();

  // Configuring TestBed with a mock for ChildComponent.
  beforeEach(() => {
    return TestBed.configureTestingModule({
      imports: [CommonModule],
      declarations: [RealComponent, MockComponent(ChildComponent)],
    }).compileComponents();
  });

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
    expect(() =>
      TestBed.createComponent(RealComponent).detectChanges(),
    ).not.toThrow();
  });
});
