import { CommonModule } from '@angular/common';
import {
  Component,
  Injectable,
  NgModule,
  OnInit,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  Actions,
  createEffect,
  EffectsFeatureModule,
  EffectsModule,
  ofType,
} from '@ngrx/effects';
import {
  createAction,
  createFeatureSelector,
  createReducer,
  on,
  props,
  Store,
  StoreFeatureModule,
  StoreModule,
} from '@ngrx/store';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { mapTo } from 'rxjs/operators';

const setValue = createAction(
  'set-value',
  props<{
    value: string;
  }>(),
);

const resetValue = createAction('reset-value');

const myReducer = {
  featureKey: 'test',
  reducer: createReducer(
    '',
    on(setValue, (state, { value }) => value),
  ),
};

const selectValue = createFeatureSelector(myReducer.featureKey);

@Injectable()
class MyEffects {
  public readonly reset$ = createEffect(() =>
    this.actions$.pipe(
      ofType(resetValue),
      mapTo(setValue({ value: '' })),
    ),
  );

  public constructor(private readonly actions$: Actions) {}
}

@Component({
  selector: 'target',
  template: '{{ value$ | async }}',
})
class MyComponent implements OnInit {
  public value$ = this.store.select(selectValue);

  public constructor(private readonly store: Store) {}

  public ngOnInit(): void {
    this.store.dispatch(setValue({ value: 'target' }));
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
    EffectsModule.forFeature([MyEffects]),
    StoreModule.forFeature(myReducer.featureKey, myReducer.reducer),
  ],
})
class MyModule {}

describe('issue-312:import-features', () => {
  beforeEach(() =>
    MockBuilder(MyComponent, MyModule)
      .keep(FormsModule)
      .keep(ReactiveFormsModule)
      .keep(StoreModule.forRoot({}))
      .keep(EffectsModule.forRoot())
      .keep(StoreFeatureModule)
      .keep(EffectsFeatureModule)
      .keep(StoreModule.forFeature('f1', createReducer(undefined)))
      .keep(StoreModule.forFeature('f2', createReducer(undefined))),
  );

  it('providers modules correctly', () => {
    const fixture = MockRender(MyComponent);
    expect(ngMocks.formatText(fixture)).toEqual('target');

    fixture.point.componentInstance.reset();
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('');
  });
});
