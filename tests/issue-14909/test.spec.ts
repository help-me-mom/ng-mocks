import { Component, forwardRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'cva-14909',
  standalone: true,
  template: '{{ value }}',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
  ],
})
class CvaComponent implements ControlValueAccessor {
  public value = '';
  public onChange: (value: string) => void = () => undefined;
  public onTouched = () => undefined;

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(
    callback: (value: string) => undefined,
  ): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => undefined): void {
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-14909',
  standalone: true,
  imports: [FormField, CvaComponent],
  template: `
    <input [formField]="f.name" />
    <textarea [formField]="f.description"></textarea>
    <select [formField]="f.choice">
      <option value="initial">Initial</option>
      <option value="updated">Updated</option>
    </select>
    <cva-14909 [formField]="f.custom" />
  `,
})
class TargetComponent {
  public readonly model = signal({
    name: '',
    description: '',
    choice: 'initial',
    custom: '',
  });
  public readonly f = form(this.model);
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14909
describe('issue-14909', () => {
  describe('native fields', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({ imports: [TargetComponent] }),
    );

    it('changes a native input and marks only that field dirty and touched', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      // FormField exposes an NgControl whose valueAccessor is null.
      ngMocks.change('input', 'Ada');

      expect(component.model()).toEqual({
        name: 'Ada',
        description: '',
        choice: 'initial',
        custom: '',
      });
      expect(component.f.name().dirty()).toBe(true);
      expect(component.f.name().touched()).toBe(true);
      expect(component.f.custom().dirty()).toBe(false);
      expect(component.f.custom().touched()).toBe(false);
      expect(
        ngMocks.find<HTMLInputElement>('input').nativeElement.value,
      ).toBe('Ada');
    });

    it('touches a native input without changing its value or dirty state', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      ngMocks.touch('input');

      expect(component.model().name).toBe('');
      expect(component.f.name().touched()).toBe(true);
      expect(component.f.name().dirty()).toBe(false);
      expect(component.f.custom().touched()).toBe(false);
    });

    it('changes a textarea through its input listener', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      ngMocks.change('textarea', 'Updated description');

      expect(component.model().description).toBe(
        'Updated description',
      );
      expect(component.f.description().dirty()).toBe(true);
      expect(component.f.description().touched()).toBe(true);
      expect(component.model().name).toBe('');
    });

    it('changes a select through its change listener', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;

      ngMocks.change('select', 'updated');

      expect(component.model().choice).toBe('updated');
      expect(component.f.choice().dirty()).toBe(true);
      expect(component.f.choice().touched()).toBe(true);
      expect(component.model().name).toBe('');
    });
  });

  for (const mode of ['real', 'mock']) {
    describe(`${mode} value accessor`, () => {
      beforeEach(() => {
        const builder = MockBuilder(TargetComponent).keep(FormField);
        return mode === 'real'
          ? builder.keep(CvaComponent)
          : builder.mock(CvaComponent);
      });

      it('changes the field through the value accessor', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;

        ngMocks.change(ngMocks.find(CvaComponent), 'Ada');

        expect(component.model().custom).toBe('Ada');
        expect(component.f.custom().dirty()).toBe(true);
        expect(component.model().name).toBe('');
        expect(component.f.name().dirty()).toBe(false);
      });

      it('touches the field through the value accessor without changing its value', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;

        ngMocks.touch(ngMocks.find(CvaComponent));

        expect(component.f.custom().touched()).toBe(true);
        expect(component.f.custom().dirty()).toBe(false);
        expect(component.model().custom).toBe('');
        expect(component.f.name().touched()).toBe(false);
      });
    });
  }
});
