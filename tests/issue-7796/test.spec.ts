import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'route',
  template: '{{ params$ | async }}',
})
class RouteComponent implements OnInit {
  public params$: Observable<string | undefined> | null = null;

  public constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.params$ = this.route.params.pipe(
      map(params => params['argle']),
    );
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/7796
describe('issue-7796', () => {
  const ofValue = new BehaviorSubject<any>(null);

  const of = <T>(value: T): Observable<T> => {
    ofValue.next(value);
    return ofValue;
  };
  afterAll(() => {
    ofValue.complete();
  });

  MockInstance.scope();
  beforeEach(() => MockBuilder(RouteComponent, [ActivatedRoute]));

  it('uses params from ActivatedRoute', async () => {
    MockInstance(ActivatedRoute, 'params', of({ argle: 'bargle' }));

    const fixture = MockRender(RouteComponent);
    expect(ngMocks.formatText(fixture)).toEqual('bargle');
  });
});
