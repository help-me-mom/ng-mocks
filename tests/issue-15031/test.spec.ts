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

@Directive({
  selector: '[secondCva]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SecondCvaDirective),
      multi: true,
    },
  ],
})
class SecondCvaDirective implements ControlValueAccessor {
  public writeValue(): void {}
  public registerOnChange(): void {}
  public registerOnTouched(): void {}
}

@Component({
  selector: 'target-15031',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input name="inputName" ownCva [formControl]="inputControl" />
    <input name="siblingName" ownCva [formControl]="siblingControl" />
    <input name="plainName" [formControl]="plainControl" />
  `,
})
class TargetComponent {
  public readonly inputControl = new FormControl('initial');
  public readonly siblingControl = new FormControl('sibling');
  public readonly plainControl = new FormControl('plain');
}

@NgModule({
  declarations: [
    TargetComponent,
    OwnCvaDirective,
    SecondCvaDirective,
  ],
  imports: [ReactiveFormsModule],
  exports: [
    ReactiveFormsModule,
    TargetComponent,
    OwnCvaDirective,
    SecondCvaDirective,
  ],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15031
// Angular selects custom before default accessors. Mock proxies must preserve
// those categories instead of turning every candidate into a custom CVA.
describe('issue-15031', () => {
  MockInstance.scope();

  for (const mode of [
    'TestBed',
    'kept',
    'mock',
    'mock default',
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
        if (mode === 'mock' || mode === 'mock custom') {
          builder.mock(OwnCvaDirective).mock(SecondCvaDirective);
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

      it('selects the custom accessor on a text input and preserves its connection', () => {
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('[name="inputName"]');
        const parent = component.inputControl;
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
        expect(candidates.length).toBe(2);
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
        expect(child.inputValue).toBe('initial');
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

      it('uses the default accessor when there is no higher-priority candidate', () => {
        const writes: Array<string | null> = [];
        MockInstance(
          DefaultValueAccessor,
          'writeValue',
          (value: string | null) => writes.push(value),
        );
        const fixture = MockRender(TargetComponent);
        const component = fixture.point.componentInstance;
        const input = ngMocks.find('[name="plainName"]');
        const child = ngMocks.get(input, DefaultValueAccessor);
        const accessor = ngMocks.get(input, NgControl).valueAccessor;
        // Older Angular versions type this multi-token as a single accessor.
        const candidates = input.injector.get(
          NG_VALUE_ACCESSOR,
        ) as ControlValueAccessor & ControlValueAccessor[];
        expect(candidates.length).toBe(1);
        expect<ControlValueAccessor | null>(candidates[0]).toBe(
          accessor,
        );

        if (mode === 'mock' || mode === 'mock default') {
          expect(
            (
              accessor as ControlValueAccessor & {
                instance: DefaultValueAccessor;
              }
            ).instance,
          ).toBe(child);
          expect(writes).toEqual(['plain']);
        } else {
          expect(accessor).toBe(child);
          expect(input.nativeElement.value).toBe('plain');
        }

        component.plainControl.setValue('parent');
        if (mode === 'mock' || mode === 'mock default') {
          expect(writes).toEqual(['plain', 'parent']);
        } else {
          expect(input.nativeElement.value).toBe('parent');
        }

        const values: Array<string | null> = [];
        const subscription =
          component.plainControl.valueChanges.subscribe(value =>
            values.push(value),
          );
        ngMocks.change(input, 'updated');
        subscription.unsubscribe();

        expect(component.plainControl.value).toBe('updated');
        expect(values).toEqual(['updated']);
        expect(component.inputControl.value).toBe('initial');
      });

      it('still rejects two genuine custom accessors', () => {
        // Keeping or mocking declarations must not hide an invalid custom pair.
        let message = '';
        try {
          MockRender(
            '<input ownCva secondCva [formControl]="inputControl" />',
            { inputControl: new FormControl('initial') },
          );
        } catch (error) {
          message = (error as Error).message;
        }
        expect(message).toContain(
          'More than one custom value accessor',
        );
      });
    });
  }
});
