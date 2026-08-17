import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Directive,
  ElementRef,
  NgModule,
} from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { By } from '@angular/platform-browser';

import { MockModule } from 'ng-mocks';

@Directive({
  selector: 'target-14653',
  host: {
    '(toggled)': 'handleChangeEvent($event.target.checked)',
  },
  standalone: false,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: ToggleValueAccessor,
      multi: true,
    },
  ],
})
class ToggleValueAccessor implements ControlValueAccessor {
  private lastValue: unknown;
  private onChange: (value: unknown) => void = () => undefined;

  public constructor(private readonly elementRef: ElementRef) {}

  public writeValue(value: unknown): void {
    this.elementRef.nativeElement.checked = this.lastValue =
      value ?? false;
  }

  public handleChangeEvent(value: unknown): void {
    this.lastValue = value;
    this.onChange(value);
  }

  public registerOnChange(fn: (value: unknown) => void): void {
    this.onChange = fn;
  }

  public registerOnTouched(): void {}
}

@NgModule({
  declarations: [ToggleValueAccessor],
  exports: [ToggleValueAccessor],
})
class UiModule {}

@Component({
  selector: 'host-14653',
  standalone: true,
  imports: [UiModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template:
    '<target-14653 (toggled)="onToggled($event)"></target-14653>',
})
class HostComponent {
  public value?: boolean;

  public onToggled(event: Event): void {
    this.value = (event as CustomEvent<boolean>).detail;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14653
describe('issue-14653', () => {
  let fixture: ComponentFixture<HostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent, MockModule(UiModule)],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  it('does not invoke a host listener from a mocked module', () => {
    const toggle = fixture.debugElement.query(By.css('target-14653'));

    toggle.triggerEventHandler('toggled', { detail: true });
    expect(fixture.componentInstance.value).toBe(true);
  });
});
