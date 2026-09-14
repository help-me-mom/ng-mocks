import { Component, ErrorHandler, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-signal-forms-root-providers',
  imports: [FormField],
  template: '<input [formField]="f.inputValue" />',
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14987
describe('TestSignalForms:root-providers', () => {
  for (const mode of ['default', 'kept']) {
    describe(`${mode} root providers`, () => {
      let errors: Error[];

      beforeEach(() => {
        errors = [];
        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .provide({
            provide: ErrorHandler,
            useValue: {
              handleError: (error: Error) => errors.push(error),
            },
          })
          .beforeCompileComponents(testBed => {
            // Capture the real DOM listener error through Angular's public handler.
            testBed.configureTestingModule({
              rethrowApplicationErrors: false,
            });
          });

        return mode === 'kept'
          ? builder.keep(NG_MOCKS_ROOT_PROVIDERS)
          : builder;
      });

      it('handles a native input event with the configured root providers', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const input = ngMocks.reveal([
          'formField',
          component.f.inputValue,
        ]);

        expect(component.model().inputValue).toBe('Ada');
        expect(input.nativeNode.value).toBe('Ada');
        expect(errors).toEqual([]);

        input.nativeNode.value = 'Grace';
        input.nativeNode.dispatchEvent(new Event('input'));

        if (mode === 'default') {
          // Angular 22's real FormField calls a method on its mocked root service.
          expect(errors.length).toBe(1);
          expect(errors[0].message).toBe(
            'validityMonitor.isBadInput is not a function',
          );
          expect(component.model().inputValue).toBe('Ada');
          expect(component.f.inputValue().dirty()).toBe(false);
        } else {
          expect(errors).toEqual([]);
          expect(component.model().inputValue).toBe('Grace');
          expect(component.f.inputValue().dirty()).toBe(true);
        }

        // An input event alone does not report blur.
        expect(component.f.inputValue().touched()).toBe(false);
        expect(input.nativeNode.value).toBe('Grace');
      });
    });
  }
});
