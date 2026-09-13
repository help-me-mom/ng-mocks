import { Injectable } from '@angular/core';
import {
  AsyncSubject,
  BehaviorSubject,
  EMPTY,
  Observable,
  of,
  ReplaySubject,
  Subject,
} from 'rxjs';
import { map } from 'rxjs/operators';

import { isMockOf, MockService } from 'ng-mocks';

let constructions = 0;
let customCalls = 0;

@Injectable()
class CustomSubject extends Subject<boolean> {
  public constructor() {
    super();
    constructions += 1;
  }

  public custom(): string {
    customCalls += 1;

    return 'real custom method';
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14936
// Observable overrides supply subscriptions while Subject methods remain dummies.
// RxJS 6 exposes incompatible internal _subscribe types, so overrides use the public subscribe type.
describe('issue-14936', () => {
  it('customizes a typed Subject with EMPTY', () => {
    const override: Pick<Observable<boolean>, 'subscribe'> = EMPTY;
    const stream = MockService<Subject<boolean>>(Subject, override);
    const next = stream.next;
    const error = stream.error;
    const complete = stream.complete;
    const values: boolean[] = [];
    const errors: Error[] = [];
    let completions = 0;

    const first = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(stream instanceof Subject).toBe(true);
    expect(stream.constructor).toBe(Subject);
    expect(next).not.toBe(Subject.prototype.next);
    expect(error).not.toBe(Subject.prototype.error);
    expect(complete).not.toBe(Subject.prototype.complete);
    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(completions).toBe(1);
    expect(first.closed).toBe(true);

    expect(stream.next(true)).toBeUndefined();
    expect(
      stream.error(new Error('dummy subject error')),
    ).toBeUndefined();
    expect(stream.complete()).toBeUndefined();
    expect(completions).toBe(1);

    const second = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(completions).toBe(2);
    expect(second.closed).toBe(true);
    expect(second).not.toBe(first);
    expect(stream.next).toBe(next);
    expect(stream.error).toBe(error);
    expect(stream.complete).toBe(complete);
  });

  it('customizes a typed BehaviorSubject with EMPTY', () => {
    const override: Pick<Observable<boolean>, 'subscribe'> = EMPTY;
    const stream = MockService<BehaviorSubject<boolean>>(
      BehaviorSubject,
      override,
    );
    const next = stream.next;
    const error = stream.error;
    const complete = stream.complete;
    const values: boolean[] = [];
    const errors: Error[] = [];
    let completions = 0;

    const first = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(stream instanceof BehaviorSubject).toBe(true);
    expect(stream.constructor).toBe(BehaviorSubject);
    expect(next).not.toBe(BehaviorSubject.prototype.next);
    expect(error).not.toBe(BehaviorSubject.prototype.error);
    expect(complete).not.toBe(BehaviorSubject.prototype.complete);
    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(completions).toBe(1);
    expect(first.closed).toBe(true);

    expect(stream.next(true)).toBeUndefined();
    expect(
      stream.error(new Error('dummy behavior error')),
    ).toBeUndefined();
    expect(stream.complete()).toBeUndefined();
    expect(completions).toBe(1);

    const second = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(completions).toBe(2);
    expect(second.closed).toBe(true);
    expect(second).not.toBe(first);
    expect(stream.next).toBe(next);
    expect(stream.error).toBe(error);
    expect(stream.complete).toBe(complete);
  });

  it('customizes a typed ReplaySubject with EMPTY', () => {
    const override: Pick<Observable<boolean>, 'subscribe'> = EMPTY;
    const stream = MockService<ReplaySubject<boolean>>(
      ReplaySubject,
      override,
    );
    const next = stream.next;
    const error = stream.error;
    const complete = stream.complete;
    const values: boolean[] = [];
    const errors: Error[] = [];
    let completions = 0;

    const first = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(stream instanceof ReplaySubject).toBe(true);
    expect(stream.constructor).toBe(ReplaySubject);
    expect(next).not.toBe(ReplaySubject.prototype.next);
    expect(error).not.toBe(ReplaySubject.prototype.error);
    expect(complete).not.toBe(ReplaySubject.prototype.complete);
    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(completions).toBe(1);
    expect(first.closed).toBe(true);

    expect(stream.next(true)).toBeUndefined();
    expect(
      stream.error(new Error('dummy replay error')),
    ).toBeUndefined();
    expect(stream.complete()).toBeUndefined();
    expect(completions).toBe(1);

    const second = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(completions).toBe(2);
    expect(second.closed).toBe(true);
    expect(second).not.toBe(first);
    expect(stream.next).toBe(next);
    expect(stream.error).toBe(error);
    expect(stream.complete).toBe(complete);
  });

  it('customizes a typed AsyncSubject with EMPTY', () => {
    const override: Pick<Observable<boolean>, 'subscribe'> = EMPTY;
    const stream = MockService<AsyncSubject<boolean>>(
      AsyncSubject,
      override,
    );
    const next = stream.next;
    const error = stream.error;
    const complete = stream.complete;
    const values: boolean[] = [];
    const errors: Error[] = [];
    let completions = 0;

    const first = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(stream instanceof AsyncSubject).toBe(true);
    expect(stream.constructor).toBe(AsyncSubject);
    expect(next).not.toBe(AsyncSubject.prototype.next);
    expect(error).not.toBe(AsyncSubject.prototype.error);
    expect(complete).not.toBe(AsyncSubject.prototype.complete);
    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(completions).toBe(1);
    expect(first.closed).toBe(true);

    expect(stream.next(true)).toBeUndefined();
    expect(
      stream.error(new Error('dummy async error')),
    ).toBeUndefined();
    expect(stream.complete()).toBeUndefined();
    expect(completions).toBe(1);

    const second = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(values).toEqual([]);
    expect(errors).toEqual([]);
    expect(completions).toBe(2);
    expect(second.closed).toBe(true);
    expect(second).not.toBe(first);
    expect(stream.next).toBe(next);
    expect(stream.error).toBe(error);
    expect(stream.complete).toBe(complete);
  });

  it('customizes a typed BehaviorSubject with the configured first value', () => {
    const override: Pick<Observable<boolean>, 'subscribe'> = of(
      false,
    );
    const stream = MockService<BehaviorSubject<boolean>>(
      BehaviorSubject,
      override,
    );
    const next = stream.next;
    const error = stream.error;
    const complete = stream.complete;
    const values: boolean[] = [];
    const errors: Error[] = [];
    let completions = 0;

    const first = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(stream instanceof BehaviorSubject).toBe(true);
    expect(stream.constructor).toBe(BehaviorSubject);
    expect(next).not.toBe(BehaviorSubject.prototype.next);
    expect(error).not.toBe(BehaviorSubject.prototype.error);
    expect(complete).not.toBe(BehaviorSubject.prototype.complete);
    expect(values).toEqual([false]);
    expect(errors).toEqual([]);
    expect(completions).toBe(1);
    expect(first.closed).toBe(true);

    expect(stream.next(true)).toBeUndefined();
    expect(
      stream.error(new Error('dummy configured error')),
    ).toBeUndefined();
    expect(stream.complete()).toBeUndefined();
    expect(values).toEqual([false]);
    expect(completions).toBe(1);

    const second = stream.subscribe({
      next: value => values.push(value),
      error: value => errors.push(value),
      complete: () => (completions += 1),
    });

    expect(values).toEqual([false, false]);
    expect(errors).toEqual([]);
    expect(completions).toBe(2);
    expect(second.closed).toBe(true);
    expect(second).not.toBe(first);
    expect(stream.next).toBe(next);
    expect(stream.error).toBe(error);
    expect(stream.complete).toBe(complete);
  });

  it('keeps inherited pipe behavior without constructing a custom Subject', () => {
    constructions = 0;
    customCalls = 0;
    const override: Pick<Observable<boolean>, 'subscribe'> = of(true);
    const stream = MockService<CustomSubject>(
      CustomSubject,
      override,
    );
    const custom = stream.custom;
    const values: string[] = [];
    const errors: Error[] = [];
    let completions = 0;

    const subscription = stream
      .pipe(
        map(value =>
          value ? 'configured value' : 'unexpected value',
        ),
      )
      .subscribe({
        next: value => values.push(value),
        error: value => errors.push(value),
        complete: () => (completions += 1),
      });

    expect(stream instanceof CustomSubject).toBe(true);
    expect(stream.constructor).toBe(CustomSubject);
    expect(isMockOf(stream, CustomSubject)).toBe(true);
    expect(constructions).toBe(0);
    expect(values).toEqual(['configured value']);
    expect(errors).toEqual([]);
    expect(completions).toBe(1);
    expect(subscription.closed).toBe(true);
    expect(custom).not.toBe(CustomSubject.prototype.custom);
    expect(stream.custom()).toBeUndefined();
    expect(stream.custom).toBe(custom);
    expect(customCalls).toBe(0);
    expect(constructions).toBe(0);
  });
});
