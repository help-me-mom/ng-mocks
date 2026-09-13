import { CommonModule } from '@angular/common';
import { Component, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  Action,
  NgxsModule,
  State,
  StateContext,
  Store,
} from '@ngxs/store';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { firstValueFrom } from 'rxjs';

class SetValue {
  public static readonly type = '[issue-14935] set-value';

  public constructor(public readonly value: string) {}
}

@State<string>({
  name: 'issue14935',
  defaults: 'initial',
})
@Injectable()
class TestState {
  public readonly handledValues: string[] = [];

  @Action(SetValue)
  public setValue(
    ctx: StateContext<string>,
    { value }: SetValue,
  ): void {
    this.handledValues.push(value);
    ctx.setState(value);
  }
}

@Component({
  imports: [CommonModule],
  selector: 'ngxs-feature-standalone-target',
  standalone: true,
  template: '{{ value$ | async }}',
})
class TargetComponent {
  public readonly value$ = this.store.select(
    (state: { issue14935: string }) => state.issue14935,
  );

  public constructor(public readonly store: Store) {}
}

@NgModule({
  exports: [TargetComponent],
  imports: [TargetComponent, NgxsModule.forFeature([TestState])],
})
class TargetModule {}

// NGXS root initialization must precede the application's feature registration.
@NgModule({
  imports: [NgxsModule.forRoot(), TargetModule],
})
class TestModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14935
describe('ngxs:feature-standalone', () => {
  let originalError: typeof console.error;
  const errors: unknown[][] = [];

  beforeEach(() => {
    originalError = console.error;
    errors.length = 0;
    console.error = (...args: unknown[]) => {
      errors.push(args);
      originalError.apply(console, args);
    };
  });

  afterEach(() => {
    console.error = originalError;
    expect(errors).toEqual([]);
  });

  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TestModule],
      }).compileComponents(),
    );

    it('registers feature state with the separately supplied root module', async () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();
      const store = ngMocks.findInstance(Store);
      const state = TestBed.inject(TestState);

      expect(store).toBe(TestBed.inject(Store));
      expect(store).toBe(fixture.componentInstance.store);
      expect(isMockOf(store, Store)).toBe(false);
      expect(isMockOf(state, TestState)).toBe(false);
      expect(state.handledValues).toEqual([]);
      expect(
        store.selectSnapshot(
          (value: { issue14935: string }) => value.issue14935,
        ),
      ).toBe('initial');
      expect(ngMocks.formatText(fixture)).toBe('initial');

      await firstValueFrom(
        store.dispatch(new SetValue('real update')),
      );
      fixture.detectChanges();

      expect(state.handledValues).toEqual(['real update']);
      expect(
        store.selectSnapshot(
          (value: { issue14935: string }) => value.issue14935,
        ),
      ).toBe('real update');
      expect(ngMocks.formatText(fixture)).toBe('real update');
      expect(ngMocks.findInstance(Store)).toBe(store);
      expect(TestBed.inject(Store)).toBe(store);
    });
  });

  describe('MockBuilder', () => {
    // Chained keep preserves Store together with its injected NGXS infrastructure.
    beforeEach(() =>
      MockBuilder(TargetComponent, TestModule)
        .keep(Store)
        .keep(NgxsModule.forRoot().ngModule)
        .keep(NgxsModule.forFeature().ngModule),
    );

    it('finds the real store and renders values dispatched to the feature state', async () => {
      const fixture = MockRender(TargetComponent);
      const store = ngMocks.findInstance(Store);
      const state = TestBed.inject(TestState);

      expect(store).toBe(TestBed.inject(Store));
      expect(store).toBe(fixture.point.componentInstance.store);
      expect(isMockOf(store, Store)).toBe(false);
      expect(isMockOf(state, TestState)).toBe(false);
      expect(state.handledValues).toEqual([]);
      expect(
        store.selectSnapshot(
          (value: { issue14935: string }) => value.issue14935,
        ),
      ).toBe('initial');
      expect(ngMocks.formatText(fixture)).toBe('initial');

      await firstValueFrom(
        store.dispatch(new SetValue('first update')),
      );
      fixture.detectChanges();

      expect(state.handledValues).toEqual(['first update']);
      expect(
        store.selectSnapshot(
          (value: { issue14935: string }) => value.issue14935,
        ),
      ).toBe('first update');
      expect(ngMocks.formatText(fixture)).toBe('first update');

      await firstValueFrom(
        store.dispatch(new SetValue('second update')),
      );
      fixture.detectChanges();

      expect(state.handledValues).toEqual([
        'first update',
        'second update',
      ]);
      expect(
        store.selectSnapshot(
          (value: { issue14935: string }) => value.issue14935,
        ),
      ).toBe('second update');
      expect(ngMocks.formatText(fixture)).toBe('second update');
      expect(ngMocks.findInstance(Store)).toBe(store);
      expect(TestBed.inject(Store)).toBe(store);
    });
  });
});
