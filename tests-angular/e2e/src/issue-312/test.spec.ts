import { CommonModule } from '@angular/common';
import {
  Component,
  Injectable,
  NgModule,
  OnInit,
} from '@angular/core';
import {
  Actions,
  createEffect,
  EffectsFeatureModule,
  EffectsModule,
  EffectsRootModule,
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
  StoreRootModule,
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
  imports: [
    CommonModule,
    EffectsModule.forRoot(),
    EffectsModule.forFeature([MyEffects]),
    StoreModule.forRoot({}),
    StoreModule.forFeature(myReducer.featureKey, myReducer.reducer),
  ],
})
class MyModule {}

describe('issue-312', () => {
  describe('real', () => {
    beforeEach(() => MockBuilder(MyComponent).keep(MyModule));

    it('renders value and resets it', () => {
      const fixture = MockRender(MyComponent);
      expect(ngMocks.formatText(fixture)).toEqual('target');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });

  describe('explicitly keep store in a mock module', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, MyModule)
        .keep(StoreRootModule)
        .keep(StoreFeatureModule)
        .keep(EffectsRootModule)
        .keep(EffectsFeatureModule),
    );

    it('renders value and resets it', () => {
      const fixture = MockRender(MyComponent);
      expect(ngMocks.formatText(fixture)).toEqual('target');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });

  describe('keep store via module with providers', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, MyModule)
        .keep(StoreModule.forRoot({}))
        .keep(
          StoreModule.forFeature(
            myReducer.featureKey,
            myReducer.reducer,
          ),
        )
        .keep(EffectsModule.forRoot())
        .keep(EffectsModule.forFeature()),
    );

    it('renders value and resets it', () => {
      const fixture = MockRender(MyComponent);
      expect(ngMocks.formatText(fixture)).toEqual('target');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });

  describe('keep store via module from providers', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, MyModule)
        .keep(StoreModule.forRoot({}).ngModule)
        .keep(
          StoreModule.forFeature(
            myReducer.featureKey,
            myReducer.reducer,
          ).ngModule,
        )
        .keep(EffectsModule.forRoot().ngModule)
        .keep(EffectsModule.forFeature().ngModule),
    );

    it('renders value and resets it', () => {
      const fixture = MockRender(MyComponent);
      expect(ngMocks.formatText(fixture)).toEqual('target');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });
});
