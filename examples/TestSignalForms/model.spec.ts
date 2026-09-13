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
  selector: 'signal-name-control',
  template: `
    <input
      [value]="value()"
      (input)="value.set($any($event.target).value)"
      (blur)="touch.emit()"
    />
  `,
})
class NameControl implements FormValueControl<string> {
  public readonly value = model('');
  public readonly touched = input(false);
  public readonly touch = output<void>();
}

@Component({
  selector: 'target-signal-forms-model',
  imports: [FormField, NameControl],
  template: `
    <signal-name-control [formField]="f.name" />
    <span class="name">{{ model().name }}</span>
  `,
})
class TargetComponent {
  public readonly model = signal({ name: 'Ada' });
  public readonly f = form(this.model);
}

describe('TestSignalForms:model', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular 22 spread targets exercise the model binding and touch output.
  if (
    !reflectComponentType(NameControl)?.outputs.some(
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
      .mock(NameControl),
  );

  it('updates the parent and rendered name through the mocked model', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(NameControl);
    const control = ngMocks.get(child, NameControl);

    expect(control.value()).toBe('Ada');

    // The mocked component still exposes the model output used by FormField.
    ngMocks.change(child, 'Grace');
    fixture.detectChanges();

    expect(component.model()).toEqual({ name: 'Grace' });
    expect(component.f.name().dirty()).toBe(true);
    expect(component.f.name().touched()).toBe(false);
    expect(control.value()).toBe('Grace');
    expect(control.touched()).toBe(false);
    expect(ngMocks.formatText(ngMocks.find('.name'))).toBe('Grace');
  });

  it('feeds touched state back into the mock without changing the name', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(NameControl);
    const control = ngMocks.get(child, NameControl);

    expect(control.touched()).toBe(false);

    // The touch output marks the field touched; its input receives that state.
    ngMocks.touch(child);
    fixture.detectChanges();

    expect(component.model()).toEqual({ name: 'Ada' });
    expect(component.f.name().dirty()).toBe(false);
    expect(component.f.name().touched()).toBe(true);
    expect(control.value()).toBe('Ada');
    expect(control.touched()).toBe(true);
    expect(ngMocks.formatText(ngMocks.find('.name'))).toBe('Ada');
  });

  it('updates the mock from the parent without emitting a child change', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const child = ngMocks.find(NameControl);
    const control = ngMocks.get(child, NameControl);
    const values: string[] = [];
    ngMocks
      .output(child, 'valueChange')
      .subscribe(value => values.push(value));

    expect(control.value()).toBe('Ada');

    // A parent write updates the binding without simulating child interaction.
    component.model.set({ name: 'Katherine' });
    fixture.detectChanges();

    expect(control.value()).toBe('Katherine');
    expect(component.f.name().value()).toBe('Katherine');
    expect(ngMocks.formatText(ngMocks.find('.name'))).toBe(
      'Katherine',
    );
    expect(values).toEqual([]);
    expect(component.f.name().dirty()).toBe(false);
    expect(component.f.name().touched()).toBe(false);
    expect(control.touched()).toBe(false);
  });
});
