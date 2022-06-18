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
import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';
import { first, tap } from 'rxjs';

class SetValue {
  static readonly type = 'set-value';

  constructor(public value: string) {}
}

@State<string>({
  name: 'test',
  defaults: 'init',
})
@Injectable()
class TestState {
  @((Action as any)(SetValue))
  setValue(ctx: StateContext<string>, { value }: SetValue) {
    ctx.setState(value);
  }
}

@Component({
  selector: 'target',
  template: '{{ value }}',
})
class TargetComponent {
  public value = '';

  public constructor(private readonly store: Store) {
    this.store.dispatch(new SetValue('target'));

    this.store
      .select(state => state.test)
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
    NgxsModule.forRoot([TestState]),
    NgxsModule.forFeature(),
  ],
})
class TargetModule {}

describe('ngxs:real', () => {
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

describe('ngxs:MockBuilder', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .keep(NgxsModule.forRoot().ngModule)
      .keep(NgxsModule.forFeature().ngModule),
  );

  const factory = MockRenderFactory(TargetComponent);
  beforeEach(() => factory.configureTestBed());

  it('selects the value', () => {
    const store = TestBed.inject(Store);
    const dispatchSpy = spyOn(store, 'dispatch');

    const fixture = factory();

    // asserting
    expect(ngMocks.formatText(fixture)).toEqual('init');
    expect(dispatchSpy).toHaveBeenCalledWith(new SetValue('target'));
  });
});
