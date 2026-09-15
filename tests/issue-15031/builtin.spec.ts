import {
  Component,
  Directive,
  forwardRef,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  DefaultValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  NgControl,
  NumberValueAccessor,
  ReactiveFormsModule,
} from '@angular/forms';

import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

const OWN_CONTROL = new InjectionToken<OwnCvaDirective>(
  'OWN_CONTROL',
);

@Directive({
  selector: 'input[ownCva]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  host: {
    '(input)': 'onChange($event.target.value)',
    '(blur)': 'onTouched()',
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => OwnCvaDirective),
      multi: true,
    },
    {
      provide: OWN_CONTROL,
      useExisting: forwardRef(() => OwnCvaDirective),
    },
  ],
})
class OwnCvaDirective implements ControlValueAccessor {
  public inputValue: string | null = null;
  public onChange: (value: string) => void = () => undefined;
  public onTouched: () => void = () => undefined;

  public writeValue(value: string | null): void {
    this.inputValue = value;
  }

  public registerOnChange(callback: (value: string) => void): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-15031-builtin',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input name="inputName" ownCva [formControl]="inputControl" />
    <input name="siblingName" ownCva [formControl]="siblingControl" />
    <input
      name="numberName"
      type="number"
      [formControl]="numberControl"
    />
    <input
      name="customNumberName"
      type="number"
      ownCva
      [formControl]="customNumberControl"
    />
    <input name="plainName" [formControl]="plainControl" />
  `,
})
class TargetComponent {
  public readonly inputControl = new FormControl('initial');
  public readonly siblingControl = new FormControl('sibling');
  public readonly numberControl = new FormControl(42);
  public readonly customNumberControl = new FormControl('12');
  public readonly plainControl = new FormControl('plain');
}

@NgModule({
  declarations: [TargetComponent, OwnCvaDirective],
  imports: [ReactiveFormsModule],
  exports: [ReactiveFormsModule, TargetComponent, OwnCvaDirective],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15031
// Angular selects custom, built-in, then default accessors. Mock proxies must
// preserve those categories instead of turning every candidate into a custom CVA.
describe('issue-15031:builtin', () => {
  MockInstance.scope();

  for (const mode of [
    'TestBed',
    'kept',
    'mock',
    'mock default',
    'mock built-in',
    'mock custom',
  ]) {
    describe(mode, () => {
      beforeEach(() => {
        if (mode === 'TestBed') {
          return TestBed.configureTestingModule({
            imports: [TargetModule],
          });
        }

        // Keep the parent and Angular form binding real in every mock combination.
        const builder =
          MockBuilder(TargetComponent).keep(TargetModule);
        if (mode === 'mock' || mode === 'mock default') {
          builder.mock(DefaultValueAccessor);
        }
        if (mode === 'mock' || mode === 'mock built-in') {
          builder.mock(NumberValueAccessor);
        }
        if (mode === 'mock' || mode === 'mock custom') {
          builder.mock(OwnCvaDirective);
        }

        return builder;
      });

      beforeEach(() => {
        // Record parent writes on each mock separately, like the real declaration.
        MockInstance(OwnCvaDirective, instance => {
          instance.inputValue = null;
          instance.writeValue = value => {
            instance.inputValue = value;
          };
        });
      });

      it('selects the custom accessor on a number input and preserves its connection', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('[name="customNumberName"]');
        const parent = component.customNumberControl;
        const child = ngMocks.get(input, OwnCvaDirective);
        const accessor = ngMocks.get(input, NgControl).valueAccessor;
        const sibling = ngMocks.get(
          ngMocks.find('[name="siblingName"]'),
          OwnCvaDirective,
        );

        // The token resolves the rendered directive; the selected proxy forwards to it.
        expect(input.injector.get(OwnCvaDirective)).toBe(child);
        expect(input.injector.get(OWN_CONTROL)).toBe(child);
        // Older Angular versions type this multi-token as a single accessor.
        const candidates = input.injector.get(
          NG_VALUE_ACCESSOR,
        ) as ControlValueAccessor & ControlValueAccessor[];
        expect(candidates.length).toBe(3);
        expect<Array<ControlValueAccessor | null>>(
          candidates,
        ).toContain(accessor);
        expect(isMockOf(child, OwnCvaDirective)).toBe(
          mode === 'mock' || mode === 'mock custom',
        );
        if (mode === 'mock' || mode === 'mock custom') {
          expect(
            (
              accessor as ControlValueAccessor & {
                instance: OwnCvaDirective;
              }
            ).instance,
          ).toBe(child);
        } else {
          expect(accessor).toBe(child);
        }
        expect(child.inputValue).toBe('12');
        expect(sibling.inputValue).toBe('sibling');

        // A parent write reaches only the selected declaration on this host.
        parent.setValue('24');
        expect(child.inputValue).toBe('24');
        expect(parent.pristine).toBe(true);
        expect(sibling.inputValue).toBe('sibling');

        // Both the real host listener and the mock helper update the parent once.
        const values: Array<string | null> = [];
        const subscription = parent.valueChanges.subscribe(value =>
          values.push(value),
        );
        ngMocks.change(input, '48');
        fixture.detectChanges();
        subscription.unsubscribe();

        expect(parent.value).toBe('48');
        expect(values).toEqual(['48']);
        expect(parent.dirty).toBe(true);
        expect(component.siblingControl.value).toBe('sibling');
        expect(component.siblingControl.pristine).toBe(true);
        expect(component.siblingControl.untouched).toBe(true);
        expect(sibling.inputValue).toBe('sibling');

        // A separate touch uses the same connection without changing either value.
        parent.markAsUntouched();
        ngMocks.touch(input);
        expect(parent.touched).toBe(true);
        expect(parent.value).toBe('48');
        expect(component.siblingControl.untouched).toBe(true);
        expect(component.siblingControl.value).toBe('sibling');
      });

      it('selects the built-in number accessor before the default accessor', () => {
        const numberWrites: Array<number | null> = [];
        const defaultWrites: Array<string | number | null> = [];
        MockInstance(
          NumberValueAccessor,
          'writeValue',
          (value: number | null) => numberWrites.push(value),
        );
        MockInstance(
          DefaultValueAccessor,
          'writeValue',
          (value: string | number | null) =>
            defaultWrites.push(value),
        );
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('[name="numberName"]');
        const child = ngMocks.get(input, NumberValueAccessor);
        const accessor = ngMocks.get(input, NgControl).valueAccessor;
        const candidates = input.injector.get(
          NG_VALUE_ACCESSOR,
        ) as ControlValueAccessor & ControlValueAccessor[];

        expect(candidates.length).toBe(2);
        expect<Array<ControlValueAccessor | null>>(
          candidates,
        ).toContain(accessor);
        if (mode === 'mock' || mode === 'mock built-in') {
          expect(
            (
              accessor as ControlValueAccessor & {
                instance: NumberValueAccessor;
              }
            ).instance,
          ).toBe(child);
          expect(numberWrites).toEqual([42]);
        } else {
          expect(accessor).toBe(child);
          expect(input.nativeElement.value).toBe('42');
        }
        // Neither default nor number candidates on custom hosts receive parent writes.
        expect(defaultWrites).not.toContain(42);
        expect(defaultWrites).not.toContain('initial');
        expect(defaultWrites).not.toContain('12');

        component.numberControl.setValue(84);
        if (mode === 'mock' || mode === 'mock built-in') {
          expect(numberWrites).toEqual([42, 84]);
        } else {
          expect(input.nativeElement.value).toBe('84');
        }
        expect(defaultWrites).not.toContain(84);

        const values: Array<number | null> = [];
        const subscription =
          component.numberControl.valueChanges.subscribe(value =>
            values.push(value),
          );
        // Older real number accessors handle both native events; mocks invoke one registered callback.
        const expectedValues =
          !isMockOf(child, NumberValueAccessor) &&
          input.listeners.some(listener => listener.name === 'change')
            ? [126, 126]
            : [126];
        ngMocks.change(input, 126);
        fixture.detectChanges();
        subscription.unsubscribe();

        expect(component.numberControl.value).toBe(126);
        expect(values).toEqual(expectedValues);
        expect(component.plainControl.value).toBe('plain');
        expect(component.customNumberControl.value).toBe('12');
      });
    });
  }
});
