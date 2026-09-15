import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-signal-forms-selectors',
  imports: [FormField],
  template: `
    <input [formField]="f.firstName" />
    <input [formField]="f.lastName" />
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
describe('TestSignalForms:selectors', () => {
  describe('real form binding', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        // Keep the binding and native event services so edits reach the model.
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('selects native fields by their field tree without extra attributes', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const first = ngMocks.reveal([
        'formField',
        component.f.firstName,
      ]);
      const last = ngMocks.reveal([
        'formField',
        component.f.lastName,
      ]);

      // Match the bound field tree, not its state or a DOM attribute.
      expect([first, last]).toEqual(ngMocks.findAll('input'));
      expect(
        ngMocks.reveal(
          ['formField', component.f.firstName()],
          undefined,
        ),
      ).toBeUndefined();
      expect(ngMocks.findAll('[formField]')).toEqual([]);
      expect(ngMocks.findAll('[formControlName]')).toEqual([]);
      expect([first, last]).toEqual(ngMocks.findAll('input[name]'));
      expect(first.nativeNode.getAttribute('name')).toBe(
        component.f.firstName().name(),
      );
      expect(last.nativeNode.getAttribute('name')).toBe(
        component.f.lastName().name(),
      );
      expect(first.nativeNode.value).toBe('Ada');
      expect(last.nativeNode.value).toBe('Lovelace');

      // Reuse the matched host to change only its bound field.
      ngMocks.change(first, 'Grace');
      fixture.detectChanges();

      expect(component.model()).toEqual({
        firstName: 'Grace',
        lastName: 'Lovelace',
      });
      expect(first.nativeNode.value).toBe('Grace');
      expect(last.nativeNode.value).toBe('Lovelace');
      expect(component.f.firstName().dirty()).toBe(true);
      expect(component.f.firstName().touched()).toBe(true);
      expect(component.f.lastName().dirty()).toBe(false);
      expect(component.f.lastName().touched()).toBe(false);
    });
  });

  describe('mocked form binding', () => {
    // Mock the directive to inspect bindings without its native form behavior.
    beforeEach(() => MockBuilder(TargetComponent).mock(FormField));

    it('selects and changes bound field trees without synchronizing native inputs', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const first = ngMocks.reveal([
        'formField',
        component.f.firstName,
      ]);
      const last = ngMocks.reveal([
        'formField',
        component.f.lastName,
      ]);

      // Mock signal inputs preserve each bound field tree.
      expect([first, last]).toEqual(ngMocks.findAll('input'));
      expect(
        ngMocks.reveal(
          ['formField', component.f.firstName()],
          undefined,
        ),
      ).toBeUndefined();
      expect(ngMocks.findAll('[formField]')).toEqual([]);
      // Generated native attributes belong to the real FormField implementation.
      expect(ngMocks.findAll('[formControlName]')).toEqual([]);
      expect(ngMocks.findAll('input[name]')).toEqual([]);
      expect(first.nativeNode.value).toBe('');
      expect(last.nativeNode.value).toBe('');

      // Reuse the matched host to update its field without restoring the native connection.
      ngMocks.change(first, 'Grace');

      // The field becomes dirty, while native values and the other field stay unchanged.
      expect(first.nativeNode.value).toBe('');
      expect(last.nativeNode.value).toBe('');
      expect(component.model()).toEqual({
        firstName: 'Grace',
        lastName: 'Lovelace',
      });
      expect(component.f.firstName().dirty()).toBe(true);
      expect(component.f.firstName().touched()).toBe(false);
      expect(component.f.lastName().dirty()).toBe(false);
      expect(component.f.lastName().touched()).toBe(false);
    });
  });
});
