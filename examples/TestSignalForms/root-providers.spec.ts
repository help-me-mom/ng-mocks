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
      let inputListenerSpy: { mockRestore(): void } | undefined;

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
            // Renderer listeners report errors through Angular's public handler.
            testBed.configureTestingModule({
              rethrowApplicationErrors: false,
            });
          });

        return mode === 'kept'
          ? builder.keep(NG_MOCKS_ROOT_PROVIDERS)
          : builder;
      });

      afterEach(() => inputListenerSpy?.mockRestore());

      it('handles a native input event with the configured root providers', () => {
        const addEventListener =
          typeof jest === 'undefined'
            ? spyOn(
                HTMLInputElement.prototype,
                'addEventListener',
              ).and.callThrough()
            : jest.spyOn(
                HTMLInputElement.prototype,
                'addEventListener',
              );
        inputListenerSpy =
          'mockRestore' in addEventListener
            ? addEventListener
            : undefined;
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const input = ngMocks.reveal([
          'formField',
          component.f.inputValue,
        ]);

        expect(component.model().inputValue).toBe('Ada');
        expect(input.nativeNode.value).toBe('Ada');
        expect(errors).toEqual([]);

        const registrations =
          'calls' in addEventListener
            ? addEventListener.calls.all().map(call => ({
                element: call.object as unknown,
                name: call.args[0],
                listener: call.args[1],
              }))
            : addEventListener.mock.calls.map((args, index) => ({
                element: addEventListener.mock.contexts[index],
                name: args[0],
                listener: args[1],
              }));
        let listener:
          EventListenerOrEventListenerObject | null | undefined;
        for (const registration of registrations) {
          if (
            registration.element === input.nativeNode &&
            registration.name === 'input'
          ) {
            listener = registration.listener;
            break;
          }
        }
        inputListenerSpy?.mockRestore();
        inputListenerSpy = undefined;

        input.nativeNode.value = 'Grace';
        if (mode === 'default') {
          // Call the registered listener directly so the intentional failure stays local.
          // Renderer listeners use ErrorHandler; Angular 22.2.3's native listener throws.
          expect(typeof listener).toBe('function');
          try {
            if (typeof listener === 'function') {
              listener.call(input.nativeNode, new Event('input'));
            }
          } catch (error) {
            if (
              !(error instanceof Error) ||
              error.message !==
                'validityMonitor.isBadInput is not a function'
            ) {
              throw error;
            }
            errors.push(error);
          }
        } else {
          input.nativeNode.dispatchEvent(new Event('input'));
        }

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
