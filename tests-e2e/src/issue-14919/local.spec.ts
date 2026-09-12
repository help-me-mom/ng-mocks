import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  Directive,
  Input,
  input,
  isSignal,
  model,
  NgModule,
  output,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockDirective,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'local-timepicker-14919',
  standalone: true,
  template: '{{ interval() }}:{{ ariaLabel() }}',
})
class LocalTimepickerComponent {
  public readonly interval = input(0, { transform: Number });
  public readonly ariaLabel = input('', { alias: 'aria-label' });
  public readonly selected = output<number>();
}

@Directive({
  selector: 'input[localTimepicker]',
  standalone: true,
})
class LocalTimepickerDirective {
  public readonly timepicker =
    input.required<LocalTimepickerComponent>({
      alias: 'localTimepicker',
    });
  public readonly openOnClick = input(false, {
    alias: 'localOpenOnClick',
    transform: booleanAttribute,
  });
  public readonly value = model<number>(0);
  @Input({ transform: booleanAttribute }) public legacy = false;
}

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  standalone: false,
  template: `
    <local-timepicker-14919
      #picker
      [interval]="interval"
      [aria-label]="label"
      (selected)="selected.push($event)"
    ></local-timepicker-14919>
    <input
      [localTimepicker]="picker"
      [localOpenOnClick]="enabled"
      [legacy]="enabled"
      [value]="value"
      (valueChange)="value = $event; changes.push($event)"
    />
  `,
})
class HostComponent {
  public interval: string | number = '30';
  public label = 'first';
  public enabled: string | boolean = 'false';
  public value = 1;
  public readonly selected: number[] = [];
  public readonly changes: number[] = [];
}

@NgModule({
  declarations: [HostComponent],
  imports: [LocalTimepickerComponent, LocalTimepickerDirective],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14919
// These local controls use Angular 17.3 authoring APIs; the integration
// project compiles them with Angular 22 alongside the published-library cases.
describe('issue-14919:local', () => {
  for (const direct of [true, false]) {
    describe(direct ? 'direct mocks' : 'MockBuilder module', () => {
      beforeEach(() =>
        direct
          ? TestBed.configureTestingModule({
              declarations: [HostComponent],
              imports: [
                MockComponent(LocalTimepickerComponent),
                MockDirective(LocalTimepickerDirective),
              ],
            }).compileComponents()
          : MockBuilder(HostComponent, TargetModule),
      );

      it('preserves local signal bindings and separate model outputs', () => {
        const fixture = TestBed.createComponent(HostComponent);
        fixture.detectChanges();
        const host = fixture.componentInstance;
        const componentElement = ngMocks.find(
          fixture,
          LocalTimepickerComponent,
        );
        const component = componentElement.componentInstance;
        const directiveElement = ngMocks.find(fixture, 'input');
        const directive = ngMocks.get(
          directiveElement,
          LocalTimepickerDirective,
        );
        const interval = component.interval;
        const label = component.ariaLabel;
        const timepicker = directive.timepicker;
        const openOnClick = directive.openOnClick;
        const value = directive.value;
        const selected = ngMocks.output<number>(
          componentElement,
          'selected',
        );
        const changes = ngMocks.output<number>(
          directiveElement,
          'valueChange',
        );

        expect(isMockOf(component, LocalTimepickerComponent)).toBe(
          true,
        );
        expect(isMockOf(directive, LocalTimepickerDirective)).toBe(
          true,
        );
        expect(isSignal(interval)).toBe(true);
        expect(isSignal(label)).toBe(true);
        expect(isSignal(timepicker)).toBe(true);
        expect(isSignal(openOnClick)).toBe(true);
        expect(isSignal(value)).toBe(true);
        expect(isSignal(directive.legacy)).toBe(false);
        // Signal transforms belong to skipped initializers, while Angular
        // retains decorator transforms in the binding metadata.
        expect<unknown>(interval()).toBe('30');
        expect(label()).toBe('first');
        expect(timepicker()).toBe(component);
        expect<unknown>(openOnClick()).toBe('false');
        expect(directive.legacy).toBe(false);
        expect(value()).toBe(1);
        expect(
          ngMocks.input<string>(componentElement, 'interval'),
        ).toBe('30');
        expect(
          ngMocks.input<string>(componentElement, 'aria-label'),
        ).toBe('first');
        expect(
          ngMocks.input<LocalTimepickerComponent>(
            directiveElement,
            'localTimepicker',
          ),
        ).toBe(component);
        expect(
          ngMocks.input<string>(directiveElement, 'localOpenOnClick'),
        ).toBe('false');
        expect(
          ngMocks.input<boolean>(directiveElement, 'legacy'),
        ).toBe(false);
        expect<unknown>(selected).toBe(component.selected);
        expect<unknown>(changes).not.toBe(value);
        expect(host.selected).toEqual([]);
        expect(host.changes).toEqual([]);

        host.interval = 45;
        host.label = 'second';
        host.enabled = true;
        host.value = 2;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(interval()).toBe(45);
        expect(label()).toBe('second');
        expect(openOnClick()).toBe(true);
        expect(directive.legacy).toBe(true);
        expect(value()).toBe(2);
        expect(host.changes).toEqual([]);

        selected.emit(7);
        changes.emit(3);
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(host.selected).toEqual([7]);
        expect(host.changes).toEqual([3]);
        expect(host.value).toBe(3);
        expect(value()).toBe(3);

        host.interval = '60';
        host.label = 'third';
        host.enabled = 'false';
        host.value = 4;
        fixture.changeDetectorRef.markForCheck();
        fixture.detectChanges();

        expect(component.interval).toBe(interval);
        expect(component.ariaLabel).toBe(label);
        expect(directive.timepicker).toBe(timepicker);
        expect(directive.openOnClick).toBe(openOnClick);
        expect(directive.value).toBe(value);
        expect<unknown>(interval()).toBe('60');
        expect(label()).toBe('third');
        expect(timepicker()).toBe(component);
        expect<unknown>(openOnClick()).toBe('false');
        expect(directive.legacy).toBe(false);
        expect(value()).toBe(4);
        expect(
          ngMocks.output<number>(componentElement, 'selected'),
        ).toBe(selected);
        expect(
          ngMocks.output<number>(directiveElement, 'valueChange'),
        ).toBe(changes);
        expect(host.selected).toEqual([7]);
        expect(host.changes).toEqual([3]);
      });
    });
  }
});
