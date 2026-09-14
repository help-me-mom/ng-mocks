---
title: How to test form submission in Angular
description: Test ngSubmit and signal form submission by editing a field and submitting its form
sidebar_label: ngSubmit
---

This component submits its `value` through `save`. The input uses
`updateOn: 'submit'`, so Angular applies an edit when the form is submitted:

```ts
import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'target-ng-submit-template-driven',
  standalone: false,
  template: `
    <form (ngSubmit)="save(value, $event)">
      <input
        name="name"
        [(ngModel)]="value"
        [ngModelOptions]="{ updateOn: 'submit' }"
      />
      <button type="submit" [disabled]="disabled">Save</button>
    </form>
  `,
})
class TargetComponent {
  public disabled = false;
  public value = 'initial';

  public save: (value: string, event: Event) => void = () => undefined;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}
```

## Test setup

Configure the testing module in `beforeEach` with [`MockBuilder`](/api/MockBuilder.md).
Keep `TargetComponent` and `FormsModule` real so Angular handles the form submission:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
);
```

## Testing submission

:::warning Dispatch the native submit event

This input uses `updateOn: 'submit'`, so `ngMocks.change` leaves its new value pending.
Submit through the native event so Angular commits the value, emits `ngSubmit`, and prevents
browser navigation. Emitting `ngSubmit` directly skips that handling.

:::

Inside an async `it`, render the component with [`MockRender`](/api/MockRender.md) and
await `ngModel` registration. Find its `NgForm` instance with
[`ngMocks.findInstance`](/api/ngMocks/findInstance.md).
Import `NgForm` from `@angular/forms` to read the form's value and submitted state.
Use [`ngMocks.change`](/api/ngMocks/change.md) to edit the input, then create a native
submit event with [`ngMocks.event`](/api/ngMocks/event.md) and dispatch it through
[`ngMocks.trigger`](/api/ngMocks/trigger.md).

The form's value uses `name="name"` as its key. The component property bound
through `[(ngModel)]` is `value`; these names can differ.

```ts
// Render the component.
const fixture = MockRender(TargetComponent);

// Wait for ngModel to register the input with the form.
await fixture.whenStable();
const component = fixture.point.componentInstance;

// Replace the application handler to check its submitted arguments.
const save = jasmine.createSpy('save');
component.save = save;

// Find the form to read its value and submitted state.
const form = ngMocks.findInstance(NgForm);

// Read the initial value.
expect(form.submitted).toBe(false);
expect(form.value).toEqual({ name: 'initial' });

// Change the input. Its value stays pending until submission.
ngMocks.change('input', 'updated');

// Assert the pending value.
expect(component.value).toBe('initial');
expect(form.value).toEqual({ name: 'initial' });
expect(save).not.toHaveBeenCalled();

// Dispatch native submit so Angular commits the edit and emits ngSubmit.
const event = ngMocks.event('submit');
ngMocks.trigger('form', event);

// Assert the result.
expect(save).toHaveBeenCalledTimes(1);
expect(save).toHaveBeenCalledWith('updated', event);
expect(component.value).toBe('updated');
expect(form.value).toEqual({ name: 'updated' });
expect(form.submitted).toBe(true);
expect(event.defaultPrevented).toBe(true);
```

## Reactive forms

A reactive form connects its input to a `FormGroup` and passes the control's submitted
value to the same kind of handler. Here, `formControlName="name"` must match
the `FormGroup` key:

```ts
import { Component, NgModule } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'target-ng-submit-reactive',
  standalone: false,
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="save(form.controls.name.value, $event)"
    >
      <input formControlName="name" />
      <button type="submit" [disabled]="disabled">Save</button>
    </form>
  `,
})
class TargetComponent {
  public disabled = false;
  public readonly form = new FormGroup({
    name: new FormControl('initial', {
      updateOn: 'submit',
    }),
  });

  public save: (value: string | null, event: Event) => void = () => undefined;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}
```

### Test setup

Configure `beforeEach` with `MockBuilder`, keeping `TargetComponent` and
`ReactiveFormsModule` real:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule).keep(ReactiveFormsModule),
);
```

### Testing submission

:::warning Dispatch the native submit event

This `FormControl` uses `updateOn: 'submit'`, so its value stays unchanged after
`ngMocks.change` until the form handles a native submit event. Submit the form before
asserting the new value; emitting `ngSubmit` directly does not commit the pending edit.

:::

Inside `it`, render the component and find its `FormGroupDirective` instance from
`@angular/forms`. This form registers synchronously, so the test can read its initial
value immediately:

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Replace the application handler to check its submitted arguments.
const save = jasmine.createSpy('save');
component.save = save;

// Find the form to read its submitted state.
const form = ngMocks.findInstance(FormGroupDirective);

// Read the initial value.
expect(form.submitted).toBe(false);
expect(component.form.value).toEqual({ name: 'initial' });

// Change the input. Its value stays pending until submission.
ngMocks.change('input', 'updated');

// Assert the pending value.
expect(component.form.value).toEqual({ name: 'initial' });
expect(save).not.toHaveBeenCalled();

// Dispatch native submit so Angular commits the edit and emits ngSubmit.
const event = ngMocks.event('submit');
ngMocks.trigger('form', event);

// Assert the result.
expect(save).toHaveBeenCalledTimes(1);
expect(save).toHaveBeenCalledWith('updated', event);
expect(component.form.value).toEqual({ name: 'updated' });
expect(form.submitted).toBe(true);
expect(event.defaultPrevented).toBe(true);
```

## Signal forms

On Angular 21 or newer, signal forms use `FormRoot` with a configured submission action.
This component records the value received by that action:

```ts
import { Component, signal } from '@angular/core';
import { form, FormField, FormRoot } from '@angular/forms/signals';

@Component({
  selector: 'target-ng-submit-signals',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="f">
      <input [formField]="f.inputValue" />
      <button type="submit">Save</button>
    </form>
  `,
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public submitted: { inputValue: string } | undefined;
  public readonly f = form(this.model, {
    submission: {
      action: async field => {
        this.submitted = field().value();
      },
    },
  });
}
```

### Test setup

Configure `beforeEach` with `MockBuilder`. Keep `TargetComponent`, `FormField`, `FormRoot`,
and `NG_MOCKS_ROOT_PROVIDERS` real:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent)
    .keep(FormField)
    .keep(FormRoot)
    .keep(NG_MOCKS_ROOT_PROVIDERS),
);
```

### Testing submission

:::warning Wait for the submission action

The submission action is asynchronous. Wait for the public `submitting` signal to become
`false` before asserting completion; fixture stability alone does not await every
submission promise. The complete example below includes the `toObservable`, `TestBed`,
and RxJS imports used for that wait.

:::

Inside an async `it`, render the component and use [`ngMocks.reveal`](/api/ngMocks/reveal.md)
to find the input through its bound field. This model updates before submission.

```ts
// Render the component.
const fixture = MockRender(TargetComponent);
const component = fixture.point.componentInstance;

// Find the input and form.
const input = ngMocks.reveal(['formField', component.f.inputValue]);
const formElement = ngMocks.find('form');

// Read the initial value.
expect(component.f.inputValue().value()).toBe('Ada');
expect(input.nativeNode.value).toBe('Ada');
expect(component.submitted).toBeUndefined();
expect(component.f().submitting()).toBe(false);

// Change the input.
ngMocks.change(input, 'Grace');
fixture.detectChanges();

// Assert the value before submission.
expect(component.f.inputValue().value()).toBe('Grace');
expect(component.model()).toEqual({ inputValue: 'Grace' });
expect(input.nativeNode.value).toBe('Grace');
expect(component.submitted).toBeUndefined();

// Dispatch native submit so FormRoot starts its submission action.
const event = ngMocks.event('submit');
ngMocks.trigger(formElement, event);
expect(component.f().submitting()).toBe(true);

// Wait for the submission action to finish.
await firstValueFrom(
  TestBed.runInInjectionContext(() =>
    toObservable(component.f().submitting),
  ).pipe(filter(submitting => !submitting)),
);

// Assert the submitted value.
expect(component.submitted).toEqual({ inputValue: 'Grace' });
expect(component.f().submitting()).toBe(false);
expect(event.defaultPrevented).toBe(true);
```

See Angular's [signal form submission guide](https://angular.dev/guide/forms/signals/form-submission)
for validation and submission-state behavior.

## Submit buttons

For either `ngSubmit` example, submit through the button by calling its native `click()` method.
The linked examples also check that the click submits the edited value and that a disabled
button does not call `save`:

```ts
// Find the button.
const button = ngMocks.find('button').nativeElement;

// Submit the form.
button.click();

// Assert the result.
expect(save).toHaveBeenCalledTimes(1);
```

## Live examples {#complete-examples}

Each complete Jasmine example includes its component, setup, and test.

### Template-driven forms

- [Source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNgSubmit/template-driven.spec.ts)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestNgSubmit/template-driven.spec.ts&initialpath=%3Fspec%3DTestNgSubmit)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestNgSubmit/template-driven.spec.ts&initialpath=%3Fspec%3DTestNgSubmit)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNgSubmit/template-driven.spec.ts"
import { Component, NgModule } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-submit-template-driven',
  standalone: false,
  template: `
    <form (ngSubmit)="save(value, $event)">
      <input
        name="name"
        [(ngModel)]="value"
        [ngModelOptions]="{ updateOn: 'submit' }"
      />
      <button type="submit" [disabled]="disabled">Save</button>
    </form>
  `,
})
class TargetComponent {
  public disabled = false;
  public value = 'initial';

  public save: (value: string, event: Event) => void = () => undefined;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [FormsModule],
})
class TargetModule {}

describe('TestNgSubmit:template-driven', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
  );

  it('calls save with the submitted value and event', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);

    // Wait for ngModel to register the input with the form.
    await fixture.whenStable();
    const component = fixture.point.componentInstance;

    // Replace the application handler to check its submitted arguments.
    const save = jasmine.createSpy('save');
    component.save = save;

    // Find the form to read its value and submitted state.
    const form = ngMocks.findInstance(NgForm);

    // Read the initial value.
    expect(form.submitted).toBe(false);
    expect(form.value).toEqual({ name: 'initial' });

    // Change the input. Its value stays pending until submission.
    ngMocks.change('input', 'updated');

    // Assert the pending value.
    expect(component.value).toBe('initial');
    expect(form.value).toEqual({ name: 'initial' });
    expect(save).not.toHaveBeenCalled();

    // Dispatch native submit so Angular commits the edit and emits ngSubmit.
    const event = ngMocks.event('submit');
    ngMocks.trigger('form', event);

    // Assert the result.
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('updated', event);
    expect(component.value).toBe('updated');
    expect(form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });
});
```

### Reactive forms

- [Source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNgSubmit/reactive.spec.ts)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestNgSubmit/reactive.spec.ts&initialpath=%3Fspec%3DTestNgSubmit)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestNgSubmit/reactive.spec.ts&initialpath=%3Fspec%3DTestNgSubmit)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNgSubmit/reactive.spec.ts"
import { Component, NgModule } from '@angular/core';
import { FormControl, FormGroup, FormGroupDirective, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-submit-reactive',
  standalone: false,
  template: `
    <form
      [formGroup]="form"
      (ngSubmit)="save(form.controls.name.value, $event)"
    >
      <input formControlName="name" />
      <button type="submit" [disabled]="disabled">Save</button>
    </form>
  `,
})
class TargetComponent {
  public disabled = false;
  public readonly form = new FormGroup({
    name: new FormControl('initial', {
      updateOn: 'submit',
    }),
  });

  public save: (value: string | null, event: Event) => void = () => undefined;
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('TestNgSubmit:reactive', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(ReactiveFormsModule),
  );

  it('calls save with the submitted value and event', () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Replace the application handler to check its submitted arguments.
    const save = jasmine.createSpy('save');
    component.save = save;

    // Find the form to read its submitted state.
    const form = ngMocks.findInstance(FormGroupDirective);

    // Read the initial value.
    expect(form.submitted).toBe(false);
    expect(component.form.value).toEqual({ name: 'initial' });

    // Change the input. Its value stays pending until submission.
    ngMocks.change('input', 'updated');

    // Assert the pending value.
    expect(component.form.value).toEqual({ name: 'initial' });
    expect(save).not.toHaveBeenCalled();

    // Dispatch native submit so Angular commits the edit and emits ngSubmit.
    const event = ngMocks.event('submit');
    ngMocks.trigger('form', event);

    // Assert the result.
    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('updated', event);
    expect(component.form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });
});
```

### Signal forms

- [Source](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNgSubmit/signals.spec.ts)
- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestNgSubmit/signals.spec.ts&initialpath=%3Fspec%3DTestNgSubmit%3Asignals)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestNgSubmit/signals.spec.ts&initialpath=%3Fspec%3DTestNgSubmit%3Asignals)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNgSubmit/signals.spec.ts"
import { Component, signal } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { TestBed } from '@angular/core/testing';
import { form, FormField, FormRoot } from '@angular/forms/signals';
import { filter, firstValueFrom } from 'rxjs';

import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-submit-signals',
  imports: [FormField, FormRoot],
  template: `
    <form [formRoot]="f">
      <input [formField]="f.inputValue" />
      <button type="submit">Save</button>
    </form>
  `,
})
class TargetComponent {
  public readonly model = signal({ inputValue: 'Ada' });
  public submitted: { inputValue: string } | undefined;
  public readonly f = form(this.model, {
    submission: {
      action: async field => {
        this.submitted = field().value();
      },
    },
  });
}

describe('TestNgSubmit:signals', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(FormField)
      .keep(FormRoot)
      .keep(NG_MOCKS_ROOT_PROVIDERS),
  );

  it('submits the edited signal model through FormRoot', async () => {
    // Render the component.
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // Find the input and form.
    const input = ngMocks.reveal(['formField', component.f.inputValue]);
    const formElement = ngMocks.find('form');

    // Read the initial value.
    expect(component.f.inputValue().value()).toBe('Ada');
    expect(input.nativeNode.value).toBe('Ada');
    expect(component.submitted).toBeUndefined();
    expect(component.f().submitting()).toBe(false);

    // Change the input.
    ngMocks.change(input, 'Grace');
    fixture.detectChanges();

    // Assert the value before submission.
    expect(component.f.inputValue().value()).toBe('Grace');
    expect(component.model()).toEqual({ inputValue: 'Grace' });
    expect(input.nativeNode.value).toBe('Grace');
    expect(component.submitted).toBeUndefined();

    // Dispatch native submit so FormRoot starts its submission action.
    const event = ngMocks.event('submit');
    ngMocks.trigger(formElement, event);
    expect(component.f().submitting()).toBe(true);

    // Wait for the submission action to finish.
    await firstValueFrom(
      TestBed.runInInjectionContext(() =>
        toObservable(component.f().submitting),
      ).pipe(filter(submitting => !submitting)),
    );

    // Assert the submitted value.
    expect(component.submitted).toEqual({ inputValue: 'Grace' });
    expect(component.f().submitting()).toBe(false);
    expect(event.defaultPrevented).toBe(true);
  });
});
```
