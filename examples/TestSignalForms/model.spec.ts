import {
  Component,
  input,
  model,
  output,
  reflectComponentType,
  signal,
} from '@angular/core';
import {
  form,
  FormField,
  FormValueControl,
} from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'signal-input-control',
  template: `
    <input
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      (blur)="touch.emit()"
    />
  `,
})
class InputControl implements FormValueControl<string> {
  public readonly value = model('');
  public readonly touched = input(false);
  public readonly touch = output<void>();
}

@Component({
  selector: 'target-signal-forms-model',
  imports: [FormField, InputControl],
  template: `
    <signal-input-control [formField]="f.inputValue" />
    <span class="input-value">{{ model().inputValue }}</span>
  `,
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}

describe('TestSignalForms:model', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular 22 spread targets exercise the model binding and touch output.
  if (
    !reflectComponentType(InputControl)?.outputs.some(
      metadata => metadata.propName === 'touch',
    )
  ) {
    it('needs compiled model and output metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .mock(InputControl),
  );

  it('updates the parent and rendered input value through the mocked model', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(InputControl);
    const control = ngMocks.get(child, InputControl);

    expect(control.value()).toBe('Ada');

    // The mocked component still exposes the model output used by FormField.
    ngMocks.change(child, 'Grace');
    fixture.detectChanges();

    expect(component.model()).toEqual({ inputValue: 'Grace' });
    expect(component.f.inputValue().dirty()).toBe(true);
    expect(component.f.inputValue().touched()).toBe(false);
    expect(control.value()).toBe('Grace');
    expect(control.touched()).toBe(false);
    expect(ngMocks.formatText(ngMocks.find('.input-value'))).toBe(
      'Grace',
    );
  });

  it('feeds touched state back into the mock without changing the input value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(InputControl);
    const control = ngMocks.get(child, InputControl);

    expect(control.touched()).toBe(false);

    // The touch output marks the field touched; its input receives that state.
    ngMocks.touch(child);
    fixture.detectChanges();

    expect(component.model()).toEqual({ inputValue: 'Ada' });
    expect(component.f.inputValue().dirty()).toBe(false);
    expect(component.f.inputValue().touched()).toBe(true);
    expect(control.value()).toBe('Ada');
    expect(control.touched()).toBe(true);
    expect(ngMocks.formatText(ngMocks.find('.input-value'))).toBe(
      'Ada',
    );
  });
});
