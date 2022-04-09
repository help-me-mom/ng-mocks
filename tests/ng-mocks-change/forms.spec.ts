import { Component, NgModule } from '@angular/core';
import { DefaultValueAccessor, FormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'my',
  template: `
    <input data-testid="inputControl" [(ngModel)]="value" />
  `,
})
class MyComponent {
  public value: number | null = null;
}

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
  imports: [FormsModule],
})
class MyModule {}

// checking how normal form works
describe('ng-mocks-change:forms:real', () => {
  beforeEach(() => MockBuilder(MyComponent).keep(MyModule));

  it('correctly changes CVA', () => {
    const component = MockRender(MyComponent).point.componentInstance;
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
    MockBuilder(MyComponent)
      .keep(MyModule)
      .mock(DefaultValueAccessor),
  );

  it('correctly changes CVA', () => {
    const component = MockRender(MyComponent).point.componentInstance;
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
