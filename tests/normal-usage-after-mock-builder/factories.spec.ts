import { Component, forwardRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
  SelectControlValueAccessor,
} from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-normal-usage-factories',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TargetComponent),
      multi: true,
    },
  ],
})
class TargetComponent implements ControlValueAccessor {
  public writeValue(): void {}
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
}

@Component({
  selector: 'native-normal-usage-factories',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <select [formControl]="control">
      <option value="first">First</option>
      <option value="second">Second</option>
    </select>
  `,
})
class NativeComponent {
  public readonly control = new FormControl('first');
}

describe('normal-usage-after-mock-builder:factories', () => {
  // Provider overrides recompile Ivy factories. Angular 14 restores the directive definition
  // alone, leaving a reflected ES5 factory that can lose the inherited Renderer2 dependency.
  it('restores native accessor construction after a provider override and reset', async () => {
    const descriptor = Object.getOwnPropertyDescriptor(
      SelectControlValueAccessor,
      'ɵfac',
    );

    await MockBuilder([
      TargetComponent,
      FormsModule,
      ReactiveFormsModule,
    ]).mock(NG_VALUE_ACCESSOR);
    MockRender(TargetComponent);

    expect(ngMocks.findInstance(NG_VALUE_ACCESSOR)).toEqual([
      undefined,
    ] as never);

    TestBed.resetTestingModule();

    expect(
      Object.getOwnPropertyDescriptor(
        SelectControlValueAccessor,
        'ɵfac',
      ),
    ).toEqual(descriptor);

    await MockBuilder([NativeComponent, ReactiveFormsModule]);
    const fixture = MockRender(NativeComponent);
    const select = ngMocks.find('select');

    expect(fixture.point.componentInstance.control.value).toBe(
      'first',
    );
    expect(select.nativeElement.value).toBe('first');

    ngMocks.change(select, 'second');

    expect(fixture.point.componentInstance.control.value).toBe(
      'second',
    );
    expect(select.nativeElement.selectedIndex).toBe(1);
  });
});
