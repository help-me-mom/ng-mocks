import {
  Component,
  input,
  model,
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
  selector: 'signal-text-control',
  template: '{{ value() }}',
})
class TextControl implements FormValueControl<string> {
  public readonly value = model('');
  public readonly name = input('');
}

@Component({
  selector: 'target-signal-forms-selectors-model',
  imports: [FormField, TextControl],
  template: `
    <signal-text-control
      data-testid="first-name"
      [formField]="f.firstName"
    />
    <signal-text-control
      data-testid="last-name"
      [formField]="f.lastName"
    />
  `,
})
class TargetComponent {
  public readonly model = signal({
    firstName: 'Ada',
    lastName: 'Lovelace',
  });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14985
describe('TestSignalForms:selectors-model', () => {
  // The root TypeScript-only runner does not transform authoring functions.
  // Angular-compiled spread targets exercise the name input and value model.
  if (
    !reflectComponentType(TextControl)?.inputs.some(
      metadata => metadata.propName === 'name',
    ) ||
    !reflectComponentType(TextControl)?.inputs.some(
      metadata => metadata.propName === 'value',
    )
  ) {
    it('needs compiled input and model metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  for (const mode of ['real', 'mock']) {
    describe(`${mode} controls`, () => {
      beforeEach(() => {
        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);

        return mode === 'real'
          ? builder.keep(TextControl)
          : builder.mock(TextControl);
      });

      it('selects custom hosts whose name inputs are not DOM attributes', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const first = ngMocks.find('[data-testid="first-name"]');
        const last = ngMocks.find('[data-testid="last-name"]');
        const control = ngMocks.get(first, TextControl);
        const sibling = ngMocks.get(last, TextControl);

        expect(ngMocks.findAll(TextControl)).toEqual([first, last]);
        expect(ngMocks.findAll('[formControlName]')).toEqual([]);
        // FormField writes the component input, not a DOM name on its host.
        expect(control.name()).toBe(component.f.firstName().name());
        expect(sibling.name()).toBe(component.f.lastName().name());
        expect(ngMocks.findAll('signal-text-control[name]')).toEqual(
          [],
        );
        expect(control.value()).toBe('Ada');
        expect(sibling.value()).toBe('Lovelace');

        ngMocks.change(first, 'Grace');
        fixture.detectChanges();

        expect(component.model()).toEqual({
          firstName: 'Grace',
          lastName: 'Lovelace',
        });
        expect(control.value()).toBe('Grace');
        expect(sibling.value()).toBe('Lovelace');
        expect(component.f.firstName().dirty()).toBe(true);
        expect(component.f.lastName().dirty()).toBe(false);
        expect(component.f.lastName().touched()).toBe(false);
      });
    });
  }
});
