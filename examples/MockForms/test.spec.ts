import { Component, forwardRef, NgModule } from '@angular/core';
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
      useExisting: forwardRef(() => CvaComponent),
    },
  ],
  selector: 'cva',
  template: 'dependency',
})
class CvaComponent implements ControlValueAccessor {
  public registerOnChange = (fn: any): void => fn;
  public registerOnTouched = (fn: any): void => fn;
  public writeValue = (obj: any): void => obj;

  public cvaMockForms() {}
}

@Component({
  selector: 'target',
  template: ` <cva [(ngModel)]="value"></cva> `,
})
class TargetComponent {
  public value: any;

  public targetMockForms() {}
}

@NgModule({
  imports: [FormsModule],
  declarations: [TargetComponent, CvaComponent],
})
class ItsModule {}

describe('MockForms', () => {
  // Helps to reset customizations after each test.
  MockInstance.scope();

  beforeEach(() => {
    // DependencyComponent is a declaration in ItsModule.
    return (
      MockBuilder(TargetComponent, ItsModule)
        // FormsModule is an import in ItsModule.
        .keep(FormsModule)
    );
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
    MockInstance(CvaComponent, 'writeValue', writeValue);

    const fixture = MockRender(TargetComponent);
    // FormsModule needs fixture.whenStable()
    // right after MockRender to install all hooks.
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // During initialization, it should be called
    // with null.
    expect(writeValue).toHaveBeenCalledWith(null);

    // Let's find the form control element
    // and simulate its change, like a user does it.
    const mockControlEl = ngMocks.find(CvaComponent);
    ngMocks.change(mockControlEl, 'foo');
    expect(component.value).toBe('foo');

    // Let's check that change on existing value
    // causes calls of `writeValue` on the mock component.
    component.value = 'bar';
    // Both below are needed to trigger writeValue.
    fixture.detectChanges();
    await fixture.whenStable();
    expect(writeValue).toHaveBeenCalledWith('bar');
  });
});
