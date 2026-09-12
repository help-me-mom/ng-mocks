import {
  ChangeDetectionStrategy,
  Component,
  isSignal,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatInput, MatInputModule } from '@angular/material/input';
import {
  MatTimepicker,
  MatTimepickerInput,
  MatTimepickerModule,
} from '@angular/material/timepicker';
import {
  isMockOf,
  MockBuilder,
  MockComponent,
  MockDirective,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.Default,
  selector: 'host-14919-library',
  standalone: false,
  template: `
    <mat-timepicker
      #picker
      [interval]="interval"
      [aria-label]="label"
      (selected)="selected.push($event.value)"
    ></mat-timepicker>
    <input
      matInput
      [matTimepicker]="picker"
      [matTimepickerOpenOnClick]="flag"
      [disabledInteractive]="flag"
      [(value)]="value"
      (valueChange)="changes.push($event)"
    />
  `,
})
class HostComponent {
  public interval = '15m';
  public label = 'initial';
  public flag = 'false';
  public value = 1;
  public readonly selected: unknown[] = [];
  public readonly changes: unknown[] = [];
}

@NgModule({
  declarations: [HostComponent],
  imports: [MatTimepickerModule, MatInputModule],
})
class HostModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14919
// @see https://github.com/help-me-mom/ng-mocks/issues/9698
// Material is an actual precompiled dependency. Current packages also retain
// development property decorators; hide those in the fallback cases while
// retaining the original compiled definitions, then restore every descriptor.
// The integration project uses Angular 22; input/output/model APIs require 17.3.
describe('issue-14919:library', () => {
  for (const metadata of ['development', 'definitions']) {
    for (const setup of ['direct', 'builder']) {
      it(`binds compiled library metadata with ${metadata} and ${setup} mocking`, async () => {
        const declarations = [
          MatTimepicker,
          MatTimepickerInput,
          MatInput,
        ];
        const componentDefinition = MatTimepicker.ɵcmp;
        const directiveDefinition = MatTimepickerInput.ɵdir;
        const inputDefinition = MatInput.ɵdir;
        const keys =
          metadata === 'definitions'
            ? [
                'propDecorators',
                '__prop__metadata__',
                '__ngMocksParsed',
                '__ngMocksDeclarations',
              ]
            : ['__ngMocksParsed', '__ngMocksDeclarations'];
        const saved = declarations.map(declaration => ({
          declaration,
          descriptors: keys.map(key => ({
            key,
            descriptor: Object.getOwnPropertyDescriptor(
              declaration,
              key,
            ),
          })),
        }));

        ngMocks.reset();
        try {
          // Reflection caches must not let an earlier test supply the bindings.
          for (const declaration of declarations) {
            for (const key of keys) {
              Reflect.deleteProperty(declaration, key);
              expect(
                Object.getOwnPropertyDescriptor(declaration, key),
              ).toBeUndefined();
            }
          }

          expect(componentDefinition).toBeDefined();
          expect(directiveDefinition).toBeDefined();
          expect(inputDefinition).toBeDefined();

          if (setup === 'direct') {
            await TestBed.configureTestingModule({
              declarations: [HostComponent],
              imports: [
                MockComponent(MatTimepicker),
                MockDirective(MatTimepickerInput),
                MockDirective(MatInput),
              ],
            }).compileComponents();
          } else {
            await MockBuilder(HostComponent, HostModule);
          }

          const fixture = MockRender(HostComponent);
          const host = fixture.point.componentInstance;
          // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
          const pickerElement = ngMocks.find(MatTimepicker);
          const picker = pickerElement.componentInstance;
          // eslint-disable-next-line es-x/no-array-prototype-find -- ngMocks.find is not Array.find.
          const inputElement = ngMocks.find('input');
          const input = ngMocks.get(inputElement, MatTimepickerInput);
          const legacy = ngMocks.get(inputElement, MatInput);
          const interval = picker.interval;
          const label = picker.ariaLabel;
          const timepicker = input.timepicker;
          const openOnClick = input.openOnClick;
          const value = input.value;
          const emitter = ngMocks.output(inputElement, 'valueChange');

          expect(isMockOf(picker, MatTimepicker)).toBe(true);
          expect(isMockOf(input, MatTimepickerInput)).toBe(true);
          expect(isMockOf(legacy, MatInput)).toBe(true);
          expect(isSignal(interval)).toBe(true);
          expect(isSignal(label)).toBe(true);
          expect(isSignal(timepicker)).toBe(true);
          expect(isSignal(openOnClick)).toBe(true);
          expect(isSignal(value)).toBe(true);
          // Signal initializer transforms are omitted by mocks. Compiled
          // decorator transforms remain available and still coerce bindings.
          expect<unknown>(interval()).toBe('15m');
          expect(label()).toBe('initial');
          expect(timepicker()).toBe(picker);
          expect<unknown>(openOnClick()).toBe('false');
          expect(legacy.disabledInteractive).toBe(false);
          expect(value()).toBe(1);
          expect(ngMocks.input(pickerElement, 'interval')).toBe(
            '15m',
          );
          expect(ngMocks.input(pickerElement, 'aria-label')).toBe(
            'initial',
          );
          expect(ngMocks.input(inputElement, 'matTimepicker')).toBe(
            picker,
          );
          expect(
            ngMocks.input(inputElement, 'matTimepickerOpenOnClick'),
          ).toBe('false');
          expect(
            ngMocks.input(inputElement, 'disabledInteractive'),
          ).toBe(false);
          expect(ngMocks.input(inputElement, 'value')).toBe(1);
          expect(host.changes).toEqual([]);
          expect<unknown>(emitter).not.toBe(value);

          ngMocks
            .output(pickerElement, 'selected')
            .emit({ source: picker, value: 'first' });
          emitter.emit(2);
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          expect(host.selected).toEqual(['first']);
          expect(host.changes).toEqual([2]);
          expect(host.value).toBe(2);
          expect(value()).toBe(2);
          expect(input.value).toBe(value);

          host.interval = '30m';
          host.label = 'updated';
          host.flag = 'true';
          host.value = 3;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          expect(picker.interval).toBe(interval);
          expect(picker.ariaLabel).toBe(label);
          expect(input.timepicker).toBe(timepicker);
          expect(input.openOnClick).toBe(openOnClick);
          expect(input.value).toBe(value);
          expect<unknown>(interval()).toBe('30m');
          expect(label()).toBe('updated');
          expect(timepicker()).toBe(picker);
          expect<unknown>(openOnClick()).toBe('true');
          expect(legacy.disabledInteractive).toBe(true);
          expect(value()).toBe(3);
          expect(host.changes).toEqual([2]);

          host.interval = '45m';
          host.label = 'last';
          host.flag = 'false';
          host.value = 4;
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();
          ngMocks
            .output(pickerElement, 'selected')
            .emit({ source: picker, value: 'last' });
          emitter.emit(5);
          fixture.changeDetectorRef.markForCheck();
          fixture.detectChanges();

          expect(picker.interval).toBe(interval);
          expect(picker.ariaLabel).toBe(label);
          expect(input.timepicker).toBe(timepicker);
          expect(input.openOnClick).toBe(openOnClick);
          expect(input.value).toBe(value);
          expect<unknown>(interval()).toBe('45m');
          expect(label()).toBe('last');
          expect(timepicker()).toBe(picker);
          expect<unknown>(openOnClick()).toBe('false');
          expect(legacy.disabledInteractive).toBe(false);
          expect(host.value).toBe(5);
          expect(value()).toBe(5);
          expect(host.selected).toEqual(['first', 'last']);
          expect(host.changes).toEqual([2, 5]);
          expect(ngMocks.input(pickerElement, 'aria-label')).toBe(
            'last',
          );
          expect(ngMocks.input(inputElement, 'value')).toBe(5);
          expect(MatTimepicker.ɵcmp).toBe(componentDefinition);
          expect(MatTimepickerInput.ɵdir).toBe(directiveDefinition);
          expect(MatInput.ɵdir).toBe(inputDefinition);
        } finally {
          try {
            TestBed.resetTestingModule();
          } finally {
            for (const { declaration, descriptors } of saved) {
              for (const { key, descriptor } of descriptors) {
                if (descriptor) {
                  // Restore the original flags/accessors as well as the value.
                  Object.defineProperty(declaration, key, descriptor);
                } else {
                  Reflect.deleteProperty(declaration, key);
                }
                expect(
                  Object.getOwnPropertyDescriptor(declaration, key),
                ).toEqual(descriptor);
              }
            }
            ngMocks.reset();
          }
        }
      });
    }
  }
});
