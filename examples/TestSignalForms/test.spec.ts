import { Component, signal } from '@angular/core';
import { form, FormField, required } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-signal-forms',
  imports: [FormField],
  template: `
    <label>
      Name
      <input [formField]="profile.inputValue" />
    </label>
    @if (profile.inputValue().touched()) {
      @for (
        error of profile.inputValue().errors();
        track error.kind
      ) {
        <span role="alert">{{ error.message }}</span>
      }
    }
    <button type="submit" [disabled]="profile().invalid()">
      Save
    </button>
  `,
})
class TargetComponent {
  public readonly model = signal({ inputValue: '' });
  public readonly profile = form(this.model, schema => {
    required(schema.inputValue, { message: 'Name is required' });
  });
}

describe('TestSignalForms', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      // Keep the form binding and its root services for native input handling.
      .keep(FormField)
      .keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('shows validation after a touch without changing the value', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    expect(component.profile.inputValue().invalid()).toBe(true);
    expect(component.profile.inputValue().touched()).toBe(false);
    expect(component.profile.inputValue().dirty()).toBe(false);
    expect(ngMocks.find('[role="alert"]', undefined)).toBeUndefined();
    expect(
      ngMocks.find<HTMLButtonElement>('button').nativeElement
        .disabled,
    ).toBe(true);

    // Blur exposes the validation message without making the field dirty.
    ngMocks.touch('input');
    fixture.detectChanges();

    expect(component.model()).toEqual({ inputValue: '' });
    expect(component.profile.inputValue().touched()).toBe(true);
    expect(component.profile.inputValue().dirty()).toBe(false);
    expect(
      component.profile
        .inputValue()
        .errors()
        .map(error => error.kind),
    ).toEqual(['required']);
    expect(ngMocks.formatText(ngMocks.find('[role="alert"]'))).toBe(
      'Name is required',
    );
  });

  it('updates the model and clears rendered validation after an edit', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    ngMocks.touch('input');
    fixture.detectChanges();
    expect(ngMocks.formatText(ngMocks.find('[role="alert"]'))).toBe(
      'Name is required',
    );

    // change includes blur, so it also marks a native field touched.
    ngMocks.change('input', 'Ada');
    fixture.detectChanges();

    expect(component.model()).toEqual({ inputValue: 'Ada' });
    expect(component.profile.inputValue().value()).toBe('Ada');
    expect(component.profile.inputValue().dirty()).toBe(true);
    expect(component.profile.inputValue().touched()).toBe(true);
    expect(component.profile.inputValue().errors()).toEqual([]);
    expect(ngMocks.find('[role="alert"]', undefined)).toBeUndefined();
    expect(
      ngMocks.find<HTMLButtonElement>('button').nativeElement
        .disabled,
    ).toBe(false);
  });

  it('renders a programmatic model update without simulating user interaction', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Model updates exercise the opposite direction from native input events.
    component.model.set({ inputValue: 'Grace' });
    fixture.detectChanges();

    expect(
      ngMocks.find<HTMLInputElement>('input').nativeElement.value,
    ).toBe('Grace');
    expect(component.profile.inputValue().value()).toBe('Grace');
    expect(component.profile.inputValue().dirty()).toBe(false);
    expect(component.profile.inputValue().touched()).toBe(false);
    expect(
      ngMocks.find<HTMLButtonElement>('button').nativeElement
        .disabled,
    ).toBe(false);
    expect(ngMocks.find('[role="alert"]', undefined)).toBeUndefined();
  });
});
