---
title: How to test ngSubmit in Angular
description: Information on how to test Angular form submission with a mock submit handler
sidebar_label: ngSubmit
---

`ngSubmit` is an output of Angular's `NgForm` and `FormGroupDirective`.
When a form is submitted, Angular emits this output to call the handler bound in the template.

To test this behavior, keep `FormsModule` or `ReactiveFormsModule` and replace the component's handler with a spy.
This follows the same approach as [form controls](/extra/mock-form-controls.md):
Angular's form directives stay real while application code can be mocked.

## Related tools

- [`MockBuilder`](/api/MockBuilder.md)
- [`MockRender`](/api/MockRender.md)
- [`ngMocks.change()`](/api/ngMocks/change.md)
- [`ngMocks.event()`](/api/ngMocks/event.md)
- [`ngMocks.trigger()`](/api/ngMocks/trigger.md)

## Template-driven forms

Let's assume that `TargetComponent` uses this template:

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

The component starts with `value = 'initial'` and `disabled = false`.
Its `save(value, event)` method handles the submitted value.
The component belongs to `TargetModule`, which imports `FormsModule`.

In the test, we replace `save` with a spy and submit the form with `ngMocks.trigger`.
The `updateOn: 'submit'` option lets us verify that Angular updates the value before calling `save`.
Import `NgForm` from `@angular/forms` to check the submitted state.

:::note
After `MockRender`, call `await fixture.whenStable()` to let `ngModel` register its control and apply the initial value.
:::

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestNgSubmit/template-driven.spec.ts&initialpath=%3Fspec%3DTestNgSubmit)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestNgSubmit/template-driven.spec.ts&initialpath=%3Fspec%3DTestNgSubmit)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNgSubmit/template-driven.spec.ts"
describe('TestNgSubmit:template-driven', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(FormsModule),
  );

  it('calls save with the submitted value and event', async () => {
    // Rendering the component and waiting for ngModel.
    const fixture = MockRender(TargetComponent);
    await fixture.whenStable();
    const component = fixture.point.componentInstance;
    const form = ngMocks.findInstance(NgForm);

    // Replacing the application handler with a spy.
    const save = jasmine.createSpy('save');
    // in case of jest
    // const save = jest.fn();
    component.save = save;

    expect(form.submitted).toBe(false);
    expect(form.value).toEqual({ name: 'initial' });

    // The value stays pending until the form is submitted.
    ngMocks.change('input', 'updated');
    expect(component.value).toBe('initial');
    expect(form.value).toEqual({ name: 'initial' });
    expect(save).not.toHaveBeenCalled();

    // Angular handles submit and emits ngSubmit to call save.
    const event = ngMocks.event('submit');
    ngMocks.trigger('form', event);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('updated', event);
    expect(component.value).toBe('updated');
    expect(form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });
});
```

## Reactive forms

For reactive forms, keep `ReactiveFormsModule` in the same way.
The component binds a `FormGroup` to the form:

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
    updateOn: 'submit',
  }),
});
```

The component's `TargetModule` imports `ReactiveFormsModule`.
Its `save` method and `disabled` property work as in the template-driven example.
Import `FormGroupDirective` from `@angular/forms` to check the submitted state.
The reactive form is registered synchronously in this example.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestNgSubmit/reactive.spec.ts&initialpath=%3Fspec%3DTestNgSubmit)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestNgSubmit/reactive.spec.ts&initialpath=%3Fspec%3DTestNgSubmit)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestNgSubmit/reactive.spec.ts"
describe('TestNgSubmit:reactive', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .keep(ReactiveFormsModule),
  );

  it('calls save with the submitted value and event', () => {
    // Rendering the component and finding its form directive.
    const component =
      MockRender(TargetComponent).point.componentInstance;
    const form = ngMocks.findInstance(FormGroupDirective);

    // Replacing the application handler with a spy.
    const save = jasmine.createSpy('save');
    // in case of jest
    // const save = jest.fn();
    component.save = save;

    expect(form.submitted).toBe(false);
    expect(component.form.value).toEqual({ name: 'initial' });

    // The value stays pending until the form is submitted.
    ngMocks.change('input', 'updated');
    expect(component.form.value).toEqual({ name: 'initial' });
    expect(save).not.toHaveBeenCalled();

    // Angular handles submit and emits ngSubmit to call save.
    const event = ngMocks.event('submit');
    ngMocks.trigger('form', event);

    expect(save).toHaveBeenCalledTimes(1);
    expect(save).toHaveBeenCalledWith('updated', event);
    expect(component.form.value).toEqual({ name: 'updated' });
    expect(form.submitted).toBe(true);
    expect(event.defaultPrevented).toBe(true);
  });
});
```

## Submit buttons

To submit through the button, call its native `click()` method:

```ts
ngMocks.find('button').nativeElement.click();

expect(save).toHaveBeenCalledTimes(1);
```

The linked examples also assert that a native button click passes the updated value and submit event to `save`,
and that a disabled button does not call `save`.

:::note
Keep Angular's form directives real to test the connection from a native `submit` event to `ngSubmit`.
Emitting `ngSubmit` directly would skip Angular's submission handling, including pending form values.
:::
