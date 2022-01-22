import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import {
  createAction,
  createFeatureSelector,
  createReducer,
  on,
  Store,
  StoreModule,
  StoreRootModule,
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

const metaReducer = (state: any) => state;

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
        metaReducers: [metaReducer],
      },
    ),
  ],
})
class MyModule {}

describe('issue-589:meta-reducers', () => {
  beforeEach(() =>
    MockBuilder(MyComponent, MyModule).keep(StoreRootModule),
  );

  it('keeps meta reducers', () => {
    expect(ngMocks.formatText(MockRender(MyComponent))).toEqual('1');
  });
});
