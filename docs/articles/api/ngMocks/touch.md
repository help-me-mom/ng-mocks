---
title: ngMocks.touch
description: Documentation about `ngMocks.touch` from ng-mocks library
---

`ngMocks.touch` helps to **simulate external touches of a form control**.
Does not matter whether the declaration of the form control is a **mock** instance or a **real** one.

To simulate a touch, we need a **debug element** the form control belongs to.

Let's assume that we have the next template:

```html
<input data-testid="inputControl" [formControl]="myControl" />
```

And, we want to **simulate a touch** of the input.

Then solution may look like that:

```ts
// looking for debug element of the input
const el = ngMocks.find(['data-testid', 'inputControl']);

// simulating touch
ngMocks.touch(el);

// asserting
expect(component.myControl.touched).toEqual(true);
```

or simply with selectors which are supported by [`ngMocks.find`](find.md).

```ts
ngMocks.touch(['data-testid', 'inputControl']);
ngMocks.touch('input');
ngMocks.touch('[data-testid="inputControl"]');
```

## Separate touch interactions

`ngMocks.touch` simulates a separate touch interaction without supplying a new value.
It can exercise a native blur handler, a CVA touch callback, or a signal control's touch output.
With a real `FormField`, a `FormValueControl` or `FormCheckboxControl` must expose `touch` in Angular 22.
Angular 21 uses the `touched` model's implicit `touchedChange` output instead.
See the [Angular 22 example](/guides/mock/signal-form-controls.md#touch)
for the `touch` output and resulting field state.

For a real CVA with focus or blur handlers on the selected element, those handlers
must report the touch to the form. Otherwise, `ngMocks.touch` can trigger blur while the field
remains untouched. Select the control's interactive element whose blur handler reports touch;
another call does not supply missing touch handling.

## Mocked signal form bindings

When `FormField` is mocked, `ngMocks.touch` marks its supplied real field touched.
Use [`ngMocks.reveal`](reveal.md) once to find the host by its field tree:

```ts
// Find the host by its supplied field tree.
const field = ngMocks.reveal(['formField', component.f.inputValue]);

// Read the initial state.
expect(component.f.inputValue().touched()).toBe(false);
expect(component.f.inputValue().dirty()).toBe(false);

// Touch the supplied field without changing its value.
ngMocks.touch(field);

// Assert that the field becomes touched and stays pristine.
expect(component.f.inputValue().touched()).toBe(true);
expect(component.f.inputValue().dirty()).toBe(false);
```

This path calls the field's `markAsTouched` without dispatching DOM events or invoking
an unregistered custom-control callback. A mocked CVA with a registered touch callback
continues to use that callback.
Touching a pristine field does not introduce an edit, but touching after a pending
`ngMocks.change` can flush it according to Angular's debounce policy, including
`debounce(path, 'blur')`.

The mocked binding does not synchronize native values or connect custom-control
inputs and outputs. Keep `FormField` real to test that full connection. See
[mocking form bindings](/guides/mock/form-bindings.md#signal-fields) for the complete
component and test example.
