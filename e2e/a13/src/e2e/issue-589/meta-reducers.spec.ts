import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import {
  Action,
  createAction,
  createFeatureSelector,
  createReducer,
  on,
  Store,
  StoreModule,
  StoreRootModule,
  USER_PROVIDED_META_REDUCERS,
} from '@ngrx/store';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const increaseValue = createAction('set-value');
const resetValue = createAction('reset-value');

const myReducer = {
  featureKey: 'test',
  reducer: createReducer(
    0,
    on(increaseValue, state => state + 1),
    on(resetValue, () => 0),
  ),
};

const selectValue = createFeatureSelector(myReducer.featureKey);

const myMetaReducer =
  (reducer: <T>(state: T | undefined, action: Action) => T) =>
  <T extends { test?: number }>(
    state: T | undefined,
    action: any,
  ) => {
    let newState = state;
    if (
      state &&
      typeof state === 'object' &&
      typeof state.test === 'number'
    ) {
      newState = {
        ...state,
        test: state.test + 100,
      };
    }

    return reducer(newState, action);
  };

@Component({
  selector: 'target',
  template: '{{ value$ | async }}',
})
class MyComponent implements OnInit {
  public value$ = this.store.select(selectValue);

  public constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.store.dispatch(increaseValue());
  }

  public reset(): void {
    this.store.dispatch(resetValue());
  }
}

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
  imports: [
    CommonModule,
    StoreModule.forRoot(
      {
        [myReducer.featureKey]: myReducer.reducer,
      },
      {
        metaReducers: [myMetaReducer as any],
      },
    ),
  ],
})
class MyModule {}

describe('issue-589:meta-reducers', () => {
  describe('.keep(StoreRootModule)', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, MyModule).keep(StoreRootModule),
    );

    it('goes w/ the meta reducer', () => {
      expect(ngMocks.formatText(MockRender(MyComponent))).toEqual(
        '101',
      );
    });
  });

  describe('.mock(USER_PROVIDED_META_REDUCERS, [])', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, MyModule)
        .keep(StoreRootModule)
        .mock(USER_PROVIDED_META_REDUCERS, []),
    );

    it('goes w/o the meta reducer', () => {
      expect(ngMocks.formatText(MockRender(MyComponent))).toEqual(
        '1',
      );
    });
  });
});
