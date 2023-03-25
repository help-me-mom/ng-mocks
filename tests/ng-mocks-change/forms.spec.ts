import { Component, NgModule } from '@angular/core';
import { DefaultValueAccessor, FormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-change-forms',
  template: `
    <input data-testid="inputControl" [(ngModel)]="value" />
  `,
})
class TargetComponent {
  public value: number | null = null;
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

// checking how normal form works
describe('ng-mocks-change:forms:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('correctly changes CVA', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const valueAccessorEl = ngMocks.find([
      'data-testid',
      'inputControl',
    ]);

    // normal change
    expect(component.value).toEqual(null);
    ngMocks.change(valueAccessorEl, 123);
    expect(component.value).toEqual(123);
  });
});

// a mock version should behavior similarly but via our own interface
describe('ng-mocks-change:forms:mock', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(TargetModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly changes CVA', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const valueAccessorEl = ngMocks.find([
      'data-testid',
      'inputControl',
    ]);

    // normal change
    expect(component.value).toEqual(null);
    ngMocks.change(valueAccessorEl, 123);
    expect(component.value).toEqual(123);
  });
});
