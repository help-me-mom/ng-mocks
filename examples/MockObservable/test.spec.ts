import { CommonModule } from '@angular/common';
import { Component, Injectable, NgModule } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value$: Observable<number[]> = new Observable();

  public getValue$(): Observable<number[]> {
    return this.value$;
  }
}

@Component({
  selector: 'target',
  template: '{{ list | json }}',
})
class TargetComponent {
  public list: number[] = [];

  public constructor(service: TargetService) {
    service.value$.subscribe(list => (this.list = list));
  }

  public targetMockObservable() {}
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule],
  providers: [TargetService],
})
class TargetModule {}

describe('MockObservable', () => {
  // Because we want to test the component, we pass it as the first
  // parameter of MockBuilder. To create its mock dependencies
  // we pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  // Now we need to customize the mock object of the service.
  // value$ is our access point to the stream.
  const value$: Subject<number[]> = new Subject();
  beforeAll(() => {
    // MockInstance helps to override mock instances.
    MockInstance(TargetService, instance =>
      ngMocks.stub(instance, {
        value$, // even it is a read-only property we can override.
      }),
    );
  });

  // Cleanup after tests.
  afterAll(() => {
    value$.complete();
    MockInstance(TargetService);
  });

  it('listens on emits of an injected subject', () => {
    // Let's render the component.
    const fixture = MockRender(TargetComponent);

    // We have not emitted anything yet, let's check the template.
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

    // Checking that a sibling method has been replaced
    // with a mock object too.
    expect(
      fixture.point.injector.get(TargetService).getValue$,
    ).toBeDefined();
    expect(
      fixture.point.injector.get(TargetService).getValue$(),
    ).toBeUndefined();
  });
});
