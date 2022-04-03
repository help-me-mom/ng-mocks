import { Component, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockProvider, MockRender } from 'ng-mocks';
import { Subject } from 'rxjs';

export const EMPTY = new Subject<any>();
EMPTY.complete();

@Injectable()
class TargetService {
  public stream$ = EMPTY;
}

@Component({
  selector: 'target',
  template: `{{ service.stream$ | async }}`,
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

// @see https://github.com/ike18t/ng-mocks/issues/270
describe('issue-270', () => {
  const mock = {
    stream$: new Subject<number>(),
  };

  afterAll(() => mock.stream$.complete());

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [MockProvider(TargetService, mock)],
    });
  });

  it('mocks the property', () => {
    const fixture = MockRender(TargetComponent);

    // default template
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target></target>',
    );

    // emit 1
    mock.stream$.next(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target>1</target>',
    );

    // emit 2
    mock.stream$.next(2);
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<target>2</target>',
    );
  });
});
