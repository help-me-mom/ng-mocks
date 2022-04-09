import { CommonModule } from '@angular/common';
import {
  Component,
  Injectable,
  NgModule,
  OnInit,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
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
  private effect = () =>
    this.actions$.pipe(
      ofType(resetValue),
      mapTo(setValue({ value: '' })),
    );

  public readonly reset$ = createEffect(this.effect);

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

describe('issue-312:only-feature', () => {
  describe('real', () => {
    beforeEach(() => {
      return TestBed.configureTestingModule({
        imports: [
          MyModule,
          StoreModule.forRoot({}),
          EffectsModule.forRoot(),
        ],
      }).compileComponents();
    });

    it('providers root modules correctly', () => {
      const fixture = MockRender(MyComponent);
      expect(ngMocks.formatText(fixture)).toEqual('target');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });

  describe('builder', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, MyModule)
        .keep(StoreModule.forRoot({}))
        .keep(EffectsModule.forRoot())
        .keep(StoreFeatureModule)
        .keep(EffectsFeatureModule),
    );

    it('providers root modules correctly', () => {
      const fixture = MockRender(MyComponent);
      expect(ngMocks.formatText(fixture)).toEqual('target');

      fixture.point.componentInstance.reset();
      fixture.detectChanges();
      expect(ngMocks.formatText(fixture)).toEqual('');
    });
  });
});
