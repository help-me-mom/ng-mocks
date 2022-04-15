import {
  createAction,
  createFeatureSelector,
  createReducer,
  on,
  props,
  Store,
  StoreModule,
} from '@ngrx/store';
import { Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';
import { first, tap } from 'rxjs';
import { provideMockStore } from '@ngrx/store/testing';

const setValue = createAction(
  'set-value',
  props<{
    value: string;
  }>(),
);

const myReducer = {
  featureKey: 'test',
  reducer: createReducer(
    'init',
    on(setValue, (state, { value }) => value),
  ),
};

const selectValue = createFeatureSelector<string>(
  myReducer.featureKey,
);

@Component({
  selector: 'target',
  template: '{{ value }}',
})
class TargetComponent {
  public value = '';

  public constructor(private readonly store: Store) {
    this.store.dispatch(setValue({ value: 'target' }));

    this.store
      .select(selectValue)
      .pipe(
        first(),
        tap(value => (this.value = value)),
      )
      .subscribe();
  }
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [
    CommonModule,
    StoreModule.forRoot({}),
    StoreModule.forFeature(myReducer.featureKey, myReducer.reducer),
  ],
})
class TargetModule {}

describe('provideMockStore:real', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      imports: [TargetModule],
    }).compileComponents(),
  );

  it('selects the value', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();

    expect(ngMocks.formatText(fixture)).toEqual('target');
  });
});

describe('provideMockStore:MockBuilder', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).provide(
      provideMockStore({
        initialState: {
          [myReducer.featureKey]: 'mock',
        },
      }),
    ),
  );

  const factory = MockRenderFactory(TargetComponent);
  beforeEach(() => factory.configureTestBed());

  it('selects the value', () => {
    const store = TestBed.inject(Store);
    const dispatchSpy = spyOn(store, 'dispatch');

    const fixture = factory();

    // asserting
    expect(ngMocks.formatText(fixture)).toEqual('mock');
    expect(dispatchSpy).toHaveBeenCalledWith(
      setValue({ value: 'target' }),
    );
  });
});
