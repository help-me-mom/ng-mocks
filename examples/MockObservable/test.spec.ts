import { CommonModule } from '@angular/common';
import { Component, Injectable, NgModule } from '@angular/core';
import { MockBuilder, MockInstance, MockRender, ngMocks } from 'ng-mocks';
import { Observable, Subject } from 'rxjs';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value$: Observable<number[]> = new Observable();
}

@Component({
  selector: 'target',
  template: `{{ list | json }}`,
})
class TargetComponent {
  public list: number[];

  constructor(service: TargetService) {
    service.value$.subscribe(list => (this.list = list));
  }
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule],
  providers: [TargetService],
})
class TargetModule {}

describe('MockObservable', () => {
  // Because we want to test the component, we pass it as the first
  // parameter of MockBuilder. To mock its dependencies we pass its
  // module as the second parameter.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  // Now we need to customize the mocked copy of the service.
  // value$ is our access point to the stream.
  const value$: Subject<number[]> = new Subject();
  beforeAll(() => {
    // MockInstance helps to override mocked instances.
    MockInstance(TargetService, {
      init: instance =>
        ngMocks.stub(instance, {
          value$, // even it is a read-only property we can override it in a type-safe way.
        }),
    });
  });

  // Cleanup after tests.
  afterAll(() => {
    value$.complete();
  });

  it('has access to the service via a component', () => {
    // Let's render the component.
    const fixture = MockRender(TargetComponent);

    // We haven't emitted anything yet, let's check the template.
    expect(fixture.nativeElement.innerHTML).not.toContain('1');
    expect(fixture.nativeElement.innerHTML).not.toContain('2');
    expect(fixture.nativeElement.innerHTML).not.toContain('3');

    // Let's simulate an emit.
    value$.next([1, 2, 3]);
    fixture.detectChanges();

    // The template should contain the emitted numbers.
    expect(fixture.nativeElement.innerHTML).toContain('1');
    expect(fixture.nativeElement.innerHTML).toContain('2');
    expect(fixture.nativeElement.innerHTML).toContain('3');

    // Let's simulate an emit.
    value$.next([]);
    fixture.detectChanges();

    // The numbers should disappear.
    expect(fixture.nativeElement.innerHTML).not.toContain('1');
    expect(fixture.nativeElement.innerHTML).not.toContain('2');
    expect(fixture.nativeElement.innerHTML).not.toContain('3');
  });
});
