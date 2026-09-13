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
    <input data-testid="first-name" [formField]="f.firstName" />
    <input data-testid="last-name" [formField]="f.lastName" />
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
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS),
    );

    it('selects a native field without relying on generated names', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const first = ngMocks.find<HTMLInputElement>(
        '[data-testid="first-name"]',
      );
      const last = ngMocks.find<HTMLInputElement>(
        '[data-testid="last-name"]',
      );

      // Signal form bindings do not recreate classic formControlName attributes.
      expect(ngMocks.findAll('[formControlName]')).toEqual([]);
      expect(ngMocks.findAll('input[name]')).toEqual([first, last]);
      expect(first.nativeElement.getAttribute('name')).toBe(
        component.f.firstName().name(),
      );
      expect(last.nativeElement.getAttribute('name')).toBe(
        component.f.lastName().name(),
      );
      expect(first.nativeElement.value).toBe('Ada');
      expect(last.nativeElement.value).toBe('Lovelace');

      ngMocks.change(first, 'Grace');
      fixture.detectChanges();

      expect(component.model()).toEqual({
        firstName: 'Grace',
        lastName: 'Lovelace',
      });
      expect(first.nativeElement.value).toBe('Grace');
      expect(last.nativeElement.value).toBe('Lovelace');
      expect(component.f.firstName().dirty()).toBe(true);
      expect(component.f.lastName().dirty()).toBe(false);
      expect(component.f.lastName().touched()).toBe(false);
    });
  });

  describe('mocked form binding', () => {
    beforeEach(() => MockBuilder(TargetComponent).mock(FormField));

    it('preserves explicit selectors without providing form behavior', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const first = ngMocks.find<HTMLInputElement>(
        '[data-testid="first-name"]',
      );
      const last = ngMocks.find<HTMLInputElement>(
        '[data-testid="last-name"]',
      );

      // Generated native attributes belong to the real FormField implementation.
      expect(ngMocks.findAll('[formControlName]')).toEqual([]);
      expect(ngMocks.findAll('input[name]')).toEqual([]);
      expect(first.nativeElement.value).toBe('');
      expect(last.nativeElement.value).toBe('');

      try {
        ngMocks.change(first, 'Grace');
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toContain(
          'Cannot find ControlValueAccessor on the element',
        );
      }

      expect(first.nativeElement.value).toBe('');
      expect(last.nativeElement.value).toBe('');
      expect(component.model()).toEqual({
        firstName: 'Ada',
        lastName: 'Lovelace',
      });
      expect(component.f.firstName().dirty()).toBe(false);
      expect(component.f.lastName().dirty()).toBe(false);
    });
  });
});
