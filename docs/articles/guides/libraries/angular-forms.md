---
title: How to test ngSubmit with Angular forms
sidebar_label: Angular forms (ngSubmit)
---

`@angular/forms` provides `ngSubmit` through `NgForm` for template-driven forms
and `FormGroupDirective` for reactive forms.
Below you can find information on how to test a component which uses `ngSubmit`.

Let's assume that a component uses a template-driven form like this:

```html
<form (ngSubmit)="save(value, $event)">
  <input
    name="name"
    [(ngModel)]="value"
    [ngModelOptions]="{ updateOn: 'submit' }"
  />
  <button type="submit" [disabled]="disabled">Save</button>
</form>
```

The component starts with `value = 'initial'`, `disabled = false`, and an empty `submissions` array.
Its `save(value, event)` method appends `{ value, event }` to that array.

To test it, we need to:

- assert passed inputs and listeners on outputs with mocked form directives
- keep the form module when testing form values and submitted state
- assert submission through the submit button

## Spec file

With [`MockBuilder`](/api/MockBuilder.md), our spec file needs a single line to provide mocks:

```ts
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

Where `TargetComponent` is the component which uses the form,
and `TargetModule` is its module, which imports `FormsModule`.

To test Angular's real form submission, keep `FormsModule` instead:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
);
```

Use the mocked setup for the output-binding test below,
and the kept setup for the template-driven submission and button tests.

## Testing ngSubmit outputs

The tools from `ng-mocks` we need:

- [`MockRender`](/api/MockRender.md): to render `TargetComponent` and get its instance
- [`ngMocks.input`](/api/ngMocks/input.md): to get an input's value
- [`ngMocks.output`](/api/ngMocks/output.md): to get an output's emitter
- [`ngMocks.event`](/api/ngMocks/event.md): to create the event passed to the handler

```ts
it('binds ngModel and ngSubmit', () => {
  // Rendering TargetComponent and accessing its instance.
  const component =
    MockRender(TargetComponent).point.componentInstance;

  // Asserting the bound input.
  expect(ngMocks.input('input', 'ngModel')).toBe('initial');
  expect(component.submissions).toEqual([]);

  // Simulating the outputs.
  ngMocks.output('input', 'ngModelChange').emit('updated');
  const event = ngMocks.event('submit');
  ngMocks.output('form', 'ngSubmit').emit(event);

  // Asserting the effect of the emits.
  expect(component.value).toBe('updated');
  expect(component.submissions).toEqual([
    { value: 'updated', event },
  ]);
});
```

:::note
Emitting `ngSubmit` directly calls the bound handler. It does not mark a real form as submitted,
commit pending `updateOn: 'submit'` values, or prevent a browser event's default action.
Keep the form module and trigger a native `submit` event to test those behaviors.
:::

## Testing template-driven form submission

With `FormsModule` kept, Angular commits pending input values before emitting `ngSubmit`.
The `updateOn: 'submit'` option in the template lets us verify this order.

The tools from `ng-mocks` we need:

- [`ngMocks.findInstance`](/api/ngMocks/findInstance.md): to find the `NgForm` instance
- [`ngMocks.change`](/api/ngMocks/change.md): to supply the pending input value
- [`ngMocks.trigger`](/api/ngMocks/trigger.md): to dispatch the native `submit` event

:::note
After `MockRender`, call `await fixture.whenStable()` so that `ngModel` has registered its control
and applied the initial value. Import `NgForm` from `@angular/forms` to check the submitted state.
:::

```ts
it('submits pending values and forwards the submit event', async () => {
  // Rendering the component and waiting for ngModel.
  const fixture = MockRender(TargetComponent);
  await fixture.whenStable();
  const component = fixture.point.componentInstance;
  const form = ngMocks.findInstance(NgForm);

  // Asserting the initial form state.
  expect(form.submitted).toBe(false);
  expect(form.value).toEqual({ name: 'initial' });
  expect(component.submissions).toEqual([]);

  // Changing the input without submitting the form.
  ngMocks.change('input', 'updated');
  expect(component.value).toBe('initial');
  expect(form.value).toEqual({ name: 'initial' });
  expect(component.submissions).toEqual([]);

  // Submitting the pending value.
  const event = ngMocks.event('submit');
  ngMocks.trigger('form', event);

  // Asserting the form state and the handler's arguments.
  expect(form.submitted).toBe(true);
  expect(form.value).toEqual({ name: 'updated' });
  expect(component.value).toBe('updated');
  expect(component.submissions).toEqual([
    { value: 'updated', event },
  ]);
  expect(event.defaultPrevented).toBe(true);
});
```

When the event identity does not matter, use `ngMocks.trigger('form', 'submit')` directly.

## Testing reactive form submission

The approach to test reactive forms is the same as above.
The component binds a `FormGroup` instead of `ngModel`:

```html
<form
  [formGroup]="form"
  (ngSubmit)="save(form.controls.name.value, $event)"
>
  <input formControlName="name" />
  <button type="submit" [disabled]="disabled">Save</button>
</form>
```

Its `form` property uses `FormControl` and `FormGroup` from `@angular/forms`:

```ts
public readonly form = new FormGroup({
  name: new FormControl('initial', {
    nonNullable: true,
    updateOn: 'submit',
  }),
});
```

The `save` method, `submissions` array, and `disabled` property work as in the template-driven example.
This component's `TargetModule` imports `ReactiveFormsModule`, which should be kept:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule)
    .keep(ReactiveFormsModule),
);
```

The reactive form is registered synchronously in this example.
Import `FormGroupDirective` from `@angular/forms` to check its submitted state.

```ts
it('submits pending values and forwards the submit event', () => {
  // Rendering TargetComponent and finding its form directive.
  const component =
    MockRender(TargetComponent).point.componentInstance;
  const form = ngMocks.findInstance(FormGroupDirective);

  expect(form.submitted).toBe(false);
  expect(component.form.value).toEqual({ name: 'initial' });
  expect(component.submissions).toEqual([]);

  // Changing the input without submitting the form.
  ngMocks.change('input', 'updated');
  expect(component.form.value).toEqual({ name: 'initial' });
  expect(component.submissions).toEqual([]);

  // Submitting the pending value.
  const event = ngMocks.event('submit');
  ngMocks.trigger('form', event);

  // Asserting the form state and the handler's arguments.
  expect(form.submitted).toBe(true);
  expect(component.form.value).toEqual({ name: 'updated' });
  expect(component.submissions).toEqual([
    { value: 'updated', event },
  ]);
  expect(event.defaultPrevented).toBe(true);
});
```

### Testing reactive form bindings

To test the bindings with mocked directives, use `MockBuilder(TargetComponent, TargetModule)`
without `.keep(ReactiveFormsModule)`. Set the model value directly before emitting `ngSubmit`:

```ts
it('binds formGroup and ngSubmit', () => {
  // Rendering TargetComponent and asserting bound inputs.
  const component =
    MockRender(TargetComponent).point.componentInstance;
  expect(ngMocks.input('form', 'formGroup')).toBe(component.form);
  expect(ngMocks.input('input', 'formControlName')).toBe('name');
  expect(component.submissions).toEqual([]);

  // Setting the model value and emitting ngSubmit.
  component.form.setValue({ name: 'updated' });
  const event = ngMocks.event('submit');
  ngMocks.output('form', 'ngSubmit').emit(event);

  // Asserting the effect of the emit.
  expect(component.submissions).toEqual([
    { value: 'updated', event },
  ]);
});
```

## Testing the submit button

With the form module kept, a native button click exercises the browser's submit-button behavior.
Use [`ngMocks.find`](/api/ngMocks/find.md) to find the button and call `.click()` on its native element.
For the template-driven example:

```ts
it('submits through the native submit button', async () => {
  // Rendering the component and waiting for ngModel.
  const fixture = MockRender(TargetComponent);
  await fixture.whenStable();
  const component = fixture.point.componentInstance;
  const form = ngMocks.findInstance(NgForm);

  // Changing the input and clicking Save.
  ngMocks.change('input', 'updated');
  const button = ngMocks.find('button')
    .nativeElement as HTMLButtonElement;
  button.click();

  // Asserting that the form was submitted once.
  expect(form.submitted).toBe(true);
  expect(form.value).toEqual({ name: 'updated' });
  expect(component.submissions.length).toBe(1);
  expect(component.submissions[0].value).toBe('updated');
  expect(component.submissions[0].event.type).toBe('submit');
  expect(component.submissions[0].event.defaultPrevented).toBe(true);
});
```

The same native click works with reactive forms. A disabled submit button does not submit the form.
To test that case, set the component's `disabled` property, mark its view for checking,
and run change detection before clicking:

```ts
// Import ChangeDetectorRef from @angular/core.
component.disabled = true;
fixture.point.injector.get(ChangeDetectorRef).markForCheck();
fixture.detectChanges();

const button = ngMocks.find('button')
  .nativeElement as HTMLButtonElement;
expect(button.disabled).toBe(true);
button.click();
expect(component.submissions).toEqual([]);
```

## Complete examples

Both suites cover mocked bindings, real submission, deferred values, native button clicks,
disabled buttons, and direct output emission on real forms:

- [Template-driven forms](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/ng-submit/template-driven.spec.ts)
- [Reactive forms](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/ng-submit/reactive.spec.ts)

For custom controls, see [how to mock form controls](/extra/mock-form-controls.md).
