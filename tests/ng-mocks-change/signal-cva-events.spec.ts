import { Component, forwardRef, signal } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'cva-signal-events',
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
  public onTouched: () => void = () => undefined;

  public writeValue(value: string): void {
    this.value = value;
  }

  public registerOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-signal-cva-events',
  imports: [FormField, CvaComponent],
  template: `
    <cva-signal-events class="callback" [formField]="f.callback" />
    <cva-signal-events
      #withTouch
      class="with-touch"
      [formField]="f.withTouch"
      (input)="
        withTouch.value = $any($event.target).value;
        withTouch.onChange(withTouch.value)
      "
      (blur)="withTouch.onTouched()"
    />
    <cva-signal-events
      #withoutTouch
      class="without-touch"
      [formField]="f.withoutTouch"
      (input)="
        withoutTouch.value = $any($event.target).value;
        withoutTouch.onChange(withoutTouch.value)
      "
      (blur)="blurCount = blurCount + 1"
    />
  `,
})
class TargetComponent {
  public readonly model = signal({
    callback: 'Ada',
    withTouch: 'Grace',
    withoutTouch: 'Katherine',
  });
  public readonly f = form(this.model);
  public blurCount = 0;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14988
describe('ng-mocks-change:signal-cva-events', () => {
  for (const mode of ['real', 'mock']) {
    describe(`${mode} callback control`, () => {
      beforeEach(() => {
        const builder = MockBuilder(TargetComponent)
          .keep(FormField)
          .keep(NG_MOCKS_ROOT_PROVIDERS);

        return mode === 'real'
          ? builder.keep(CvaComponent)
          : builder.mock(CvaComponent);
      });

      it('keeps the change and touch callbacks separate from host blur', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const child = ngMocks.find('.callback');
        const blurs: string[] = [];
        // Observe DOM events without adding Angular host event handling.
        child.nativeElement.addEventListener('blur', () =>
          blurs.push('blur'),
        );

        ngMocks.change(child, 'Updated');
        fixture.detectChanges();

        expect(component.model()).toEqual({
          callback: 'Updated',
          withTouch: 'Grace',
          withoutTouch: 'Katherine',
        });
        expect(component.f.callback().dirty()).toBe(true);
        expect(component.f.callback().touched()).toBe(false);
        expect(blurs).toEqual(mode === 'real' ? [] : ['blur']);

        ngMocks.touch(child);
        fixture.detectChanges();

        expect(component.model().callback).toBe('Updated');
        expect(component.f.callback().dirty()).toBe(true);
        expect(component.f.callback().touched()).toBe(true);
        expect(blurs).toEqual(
          mode === 'real' ? [] : ['blur', 'blur'],
        );
        expect(component.f.withTouch().dirty()).toBe(false);
        expect(component.f.withTouch().touched()).toBe(false);
        expect(component.f.withoutTouch().dirty()).toBe(false);
        expect(component.f.withoutTouch().touched()).toBe(false);
        expect(component.blurCount).toBe(0);
      });
    });
  }

  describe('real controls with host event handlers', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .keep(FormField)
        .keep(NG_MOCKS_ROOT_PROVIDERS)
        .keep(CvaComponent),
    );

    it('marks the field touched when the blur handler reports the touch', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const child = ngMocks.find('.with-touch');
      const blurs: string[] = [];
      child.nativeElement.addEventListener('blur', () =>
        blurs.push('blur'),
      );

      ngMocks.change(child, 'Updated');
      fixture.detectChanges();

      expect(component.model()).toEqual({
        callback: 'Ada',
        withTouch: 'Updated',
        withoutTouch: 'Katherine',
      });
      expect(ngMocks.get(child, CvaComponent).value).toBe('Updated');
      expect(ngMocks.formatText(child)).toBe('Updated');
      expect(component.f.withTouch().dirty()).toBe(true);
      expect(component.f.withTouch().touched()).toBe(true);
      expect(blurs).toEqual(['blur']);
      expect(component.f.callback().dirty()).toBe(false);
      expect(component.f.callback().touched()).toBe(false);
      expect(component.f.withoutTouch().dirty()).toBe(false);
      expect(component.f.withoutTouch().touched()).toBe(false);
    });

    it('does not infer a touch from a blur handler that omits the touch callback', () => {
      const fixture = MockRender(TargetComponent);
      const component = fixture.point.componentInstance;
      const child = ngMocks.find('.without-touch');

      ngMocks.change(child, 'Updated');
      fixture.detectChanges();

      expect(component.model().withoutTouch).toBe('Updated');
      expect(ngMocks.get(child, CvaComponent).value).toBe('Updated');
      expect(ngMocks.formatText(child)).toBe('Updated');
      expect(component.f.withoutTouch().dirty()).toBe(true);
      expect(component.f.withoutTouch().touched()).toBe(false);
      expect(component.blurCount).toBe(1);

      // A separate blur interaction still depends on the control's touch wiring.
      ngMocks.touch(child);
      fixture.detectChanges();

      expect(component.model()).toEqual({
        callback: 'Ada',
        withTouch: 'Grace',
        withoutTouch: 'Updated',
      });
      expect(component.f.withoutTouch().dirty()).toBe(true);
      expect(component.f.withoutTouch().touched()).toBe(false);
      expect(component.blurCount).toBe(2);
      expect(component.f.callback().dirty()).toBe(false);
      expect(component.f.callback().touched()).toBe(false);
      expect(component.f.withTouch().dirty()).toBe(false);
      expect(component.f.withTouch().touched()).toBe(false);
    });
  });
});
