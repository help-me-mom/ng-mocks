import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import {
  isMockOf,
  MockProvider,
  MockService,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class CustomObservable<T> extends Observable<T> {
  custom() {}
}

@Injectable()
class TodoService {
  constructor(
    public readonly observable: CustomObservable<boolean>,
  ) {}
}

ngMocks.defaultMock(TodoService, () => ({
  observable: MockService(CustomObservable, of(true)),
}));

// Tests insures that MockService applies `of` to the initial class correctly.
// So, if someone subscribes to it, it emits its values.
// And, in the same time it provides correct customizations of the initial class.
describe('MockService:observable', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [
        MockProvider(CustomObservable),
        MockProvider(TodoService),
      ],
    }).compileComponents(),
  );

  it('mocks class and of correctly', () => {
    const instance = ngMocks.get(TodoService);

    // The custom method is a mock.
    expect(instance.observable.custom).toBeDefined();
    // The instance is a mock.
    expect(isMockOf(instance.observable, CustomObservable)).toEqual(
      true,
    );

    // The instance behaves as `of`.
    let actual = false;
    instance.observable.subscribe(value => (actual = value));
    expect(actual).toEqual(true);
  });
});
