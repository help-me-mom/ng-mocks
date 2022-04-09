import { Component, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  providers: [
    {
      multi: true,
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DependencyComponent),
    },
  ],
  selector: 'app-child',
  template: 'dependency',
})
class DependencyComponent implements ControlValueAccessor {
  public registerOnChange = (fn: any): void => fn;
  public registerOnTouched = (fn: any): void => fn;
  public writeValue = (obj: any): void => obj;
}

@Component({
  selector: 'tested',
  template: `
    <app-child
      [ngModel]="value"
      (ngModelChange)="value = $event"
    ></app-child>
  `,
})
class TestedComponent {
  public value: any;
}

describe('MockForms', () => {
  // Helps to reset customizations after each test.
  MockInstance.scope();

  beforeEach(() => {
    return MockBuilder(TestedComponent)
      .mock(DependencyComponent)
      .keep(FormsModule);
  });

  it('sends the correct value to the mock form component', async () => {
    // That is our spy on writeValue calls.
    // With auto spy this code is not needed.
    const writeValue =
      typeof jest === 'undefined'
        ? jasmine.createSpy('writeValue')
        : jest.fn();
    // in case of jest
    // const writeValue = jest.fn();

    // Because of early calls of writeValue, we need to install
    // the spy via MockInstance before the render.
    MockInstance(DependencyComponent, 'writeValue', writeValue);

    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    // During initialization it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's find the form control element
    // and simulate its change, like a user does it.
    const mockControlEl = ngMocks.find(DependencyComponent);
    ngMocks.change(mockControlEl, 'foo');
    await fixture.whenStable();
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mock component.
    component.value = 'bar';
    fixture.detectChanges();
    await fixture.whenStable();
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
