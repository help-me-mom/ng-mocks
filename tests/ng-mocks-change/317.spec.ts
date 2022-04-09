import { Component, NgModule } from '@angular/core';
import { DefaultValueAccessor, FormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'my',
  template: `
    <input data-testid="inputControl" [(ngModel)]="value" />
    <span></span>
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

describe('ng-mocks-change:317', () => {
  beforeEach(() =>
    MockBuilder(MyComponent)
      .keep(MyModule)
      .mock(DefaultValueAccessor),
  );

  it('finds by css selector', () => {
    const component = MockRender(MyComponent).point.componentInstance;
    // normal change
    expect(component.value).toEqual(null);
    ngMocks.change('input', 123);
    expect(component.value).toEqual(123);
  });

  it('finds by attribute selector', () => {
    const component = MockRender(MyComponent).point.componentInstance;
    // normal change
    expect(component.value).toEqual(null);
    ngMocks.change(['data-testid', 'inputControl'], 123);
    expect(component.value).toEqual(123);
  });

  it('throws on undefined', () => {
    MockRender(MyComponent);
    expect(() => ngMocks.change(undefined, 123)).toThrowError(
      'Cannot find an element via ngMocks.change(<EMPTY>)',
    );
  });

  it('throws on unknown', () => {
    MockRender(MyComponent);
    expect(() => ngMocks.change('span', 123)).toThrowError(
      /Cannot find ControlValueAccessor on the element/,
    );
  });
});
