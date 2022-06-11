import { CommonModule } from '@angular/common';
import { Component, NgModule, OnInit } from '@angular/core';
import {
  createAction,
  createFeatureSelector,
  createReducer,
  on,
  Store,
  StoreFeatureModule,
  StoreModule,
} from '@ngrx/store';
import {
  MockBuilder,
  MockedComponentFixture,
  MockRender,
  ngMocks,
} from 'ng-mocks';

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
    StoreModule.forFeature(myReducer.featureKey, myReducer.reducer),
  ],
})
class MyModule {}

describe('issue-488', () => {
  let fixture: MockedComponentFixture<MyComponent>;

  ngMocks.throwOnConsole();
  ngMocks.faster();

  beforeAll(() =>
    MockBuilder(
      [MyComponent, StoreModule.forRoot({})],
      MyModule,
    ).keep(StoreFeatureModule),
  );

  describe('faster multi render', () => {
    beforeEach(() => (fixture = MockRender(MyComponent)));

    it('first test has brand new render', () => {
      expect(ngMocks.formatText(fixture)).toEqual('1');

      ngMocks.findInstance(Store).dispatch(increaseValue());
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('2');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('0');
    });

    it('second test has brand new render', () => {
      expect(ngMocks.formatText(fixture)).toEqual('1');

      ngMocks.findInstance(Store).dispatch(increaseValue());
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('2');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('0');
    });
  });

  describe('faster single render', () => {
    beforeAll(() => (fixture = MockRender(MyComponent)));

    it('first test has render of 1', () => {
      expect(ngMocks.formatText(fixture)).toEqual('1');

      ngMocks.findInstance(Store).dispatch(increaseValue());
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('2');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('0');
    });

    it('second test continues the prev state', () => {
      expect(ngMocks.formatText(fixture)).toEqual('0');

      ngMocks.findInstance(Store).dispatch(increaseValue());
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('1');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('0');
    });
  });
});
