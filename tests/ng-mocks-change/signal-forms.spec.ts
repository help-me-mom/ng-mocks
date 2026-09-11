import { Component, forwardRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  NgModel,
  ReactiveFormsModule,
} from '@angular/forms';
import { form, FormField } from '@angular/forms/signals';

import { MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'cva-ng-mocks-change-signal-forms',
  standalone: true,
  imports: [FormField],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CvaComponent),
      multi: true,
    },
  ],
  template: '<input [formField]="f.name" />',
})
class CvaComponent implements ControlValueAccessor {
  public readonly model = signal({ name: 'inner' });
  public readonly f = form(this.model);
  public outerValue: string | null = null;
  public onChange: (value: string | null) => void = () => undefined;
  public onTouched: () => void = () => undefined;

  public writeValue(value: string | null): void {
    this.outerValue = value;
  }

  public registerOnChange(
    callback: (value: string | null) => void,
  ): void {
    this.onChange = callback;
  }

  public registerOnTouched(callback: () => void): void {
    this.onTouched = callback;
  }
}

@Component({
  selector: 'target-ng-mocks-change-signal-forms',
  standalone: true,
  imports: [CvaComponent, FormsModule, ReactiveFormsModule],
  template: `
    <cva-ng-mocks-change-signal-forms
      class="form-control"
      [formControl]="control"
    />
    <cva-ng-mocks-change-signal-forms
      class="ng-model"
      [(ngModel)]="value"
    />
  `,
})
class TargetComponent {
  public readonly control = new FormControl('parent control');
  public value = 'parent model';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14909
describe('ng-mocks-change:signal-forms', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [TargetComponent] }),
  );

  it('changes an inner signal field without updating the ancestor FormControl', async () => {
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const child = ngMocks.get(
      ngMocks.find('.form-control'),
      CvaComponent,
    );
    const values: Array<string | null> = [];
    const subscription = component.control.valueChanges.subscribe(
      value => values.push(value),
    );

    // The inner NgControl has no CVA; ancestor form directives belong to the host.
    ngMocks.change('.form-control input', 'updated');
    subscription.unsubscribe();

    expect(child.model().name).toBe('updated');
    expect(child.f.name().dirty()).toBe(true);
    expect(child.f.name().touched()).toBe(true);
    expect(child.outerValue).toBe('parent control');
    expect(component.control.value).toBe('parent control');
    expect(component.control.dirty).toBe(false);
    expect(component.control.touched).toBe(false);
    expect(values).toEqual([]);
  });

  it('touches an inner signal field without touching the ancestor FormControl', async () => {
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const child = ngMocks.get(
      ngMocks.find('.form-control'),
      CvaComponent,
    );

    ngMocks.touch('.form-control input');

    expect(child.model().name).toBe('inner');
    expect(child.f.name().dirty()).toBe(false);
    expect(child.f.name().touched()).toBe(true);
    expect(child.outerValue).toBe('parent control');
    expect(component.control.value).toBe('parent control');
    expect(component.control.dirty).toBe(false);
    expect(component.control.touched).toBe(false);
  });

  it('changes an inner signal field without emitting through the ancestor NgModel', async () => {
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const host = ngMocks.find('.ng-model');
    const child = ngMocks.get(host, CvaComponent);
    const ngModel = ngMocks.get(host, NgModel);
    const values: string[] = [];
    const subscription = ngModel.update.subscribe(value =>
      values.push(value),
    );

    ngMocks.change('.ng-model input', 'updated');
    subscription.unsubscribe();

    expect(child.model().name).toBe('updated');
    expect(child.f.name().dirty()).toBe(true);
    expect(child.f.name().touched()).toBe(true);
    expect(child.outerValue).toBe('parent model');
    expect(component.value).toBe('parent model');
    expect(ngModel.control.value).toBe('parent model');
    expect(ngModel.control.dirty).toBe(false);
    expect(ngModel.control.touched).toBe(false);
    expect(values).toEqual([]);
  });

  it('touches an inner signal field without touching the ancestor NgModel', async () => {
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const host = ngMocks.find('.ng-model');
    const child = ngMocks.get(host, CvaComponent);
    const ngModel = ngMocks.get(host, NgModel);

    ngMocks.touch('.ng-model input');

    expect(child.model().name).toBe('inner');
    expect(child.f.name().dirty()).toBe(false);
    expect(child.f.name().touched()).toBe(true);
    expect(child.outerValue).toBe('parent model');
    expect(component.value).toBe('parent model');
    expect(ngModel.control.value).toBe('parent model');
    expect(ngModel.control.dirty).toBe(false);
    expect(ngModel.control.touched).toBe(false);
  });
});
