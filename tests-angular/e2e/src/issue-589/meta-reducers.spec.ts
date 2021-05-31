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
import {
  INITIAL_OPTIONS,
  StoreDevtoolsModule,
} from '@ngrx/store-devtools';
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

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
  imports: [
    CommonModule,
    StoreModule.forRoot({
      [myReducer.featureKey]: myReducer.reducer,
    }),
    StoreDevtoolsModule.instrument({
      maxAge: 6,
    }),
  ],
})
class MyModule {}

describe('issue-589:dev-tools', () => {
  beforeEach(() =>
    MockBuilder(MyComponent, MyModule).keep(StoreRootModule),
  );

  it('excludes StoreDevtoolsModule by default', () => {
    expect(ngMocks.formatText(MockRender(MyComponent))).toEqual('1');
  });
});
