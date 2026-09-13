---
title: ngMocks.change
description: Documentation about `ngMocks.change` from ng-mocks library
---

`ngMocks.change` helps to **simulate external changes of a form control**.
Does not matter whether the declaration of the form control is a **mock** instance or a **real** one.

To simulate a change, we need a **debug element** the form control belongs to, and the desired value for the change.

Let's assume that we have the next template:

```html
<input data-testid="inputControl" [(ngModel)]="value" />
```

And, we want to **simulate a change** of the input which would set value to `123`.

Then solution may look like that:

```ts
// looking for debug element of the input
const el = ngMocks.find(['data-testid', 'inputControl']);

// simulating change
ngMocks.change(el, 123);

// asserting
expect(component.value).toEqual(123);
```

or simply with selectors which are supported by [`ngMocks.find`](find.md).

```ts
ngMocks.change('input', 123);
```
```ts
ngMocks.change('[data-testid="inputControl"]', 123);
```
```ts
ngMocks.change(['data-testid'], 123);
```
```ts
ngMocks.change(['data-testid', 'inputControl'], 123);
```

Profit!

It supports `FormsModule`, `ReactiveFormsModule`, and [signal forms](/guides/signal-forms.md).
Supported hosts include native `input`, `textarea`, and `select` elements with `[formField]`,
and real or mocked `ControlValueAccessor`, `FormValueControl`, and `FormCheckboxControl` components.

Changing a value and marking a field touched are separate interactions. Whether
`ngMocks.change` also triggers a **blur** event depends on the selected control:

| Selected control | Blur and touched behavior |
| --- | --- |
| Native form element | Includes blur. Touched state follows the real form binding and its update policy. |
| Real CVA with input/change event handlers on the selected element | Includes blur. The blur handler must report the touch to the form binding. |
| Real CVA using its registered change callback | Invokes the registered change callback without blur or touch. Use `ngMocks.touch` for a separate touch interaction. |
| Mocked CVA | Includes host blur, but does not call the CVA touch callback. Use `ngMocks.touch` to invoke that callback. |
| Real or mocked `FormValueControl` / `FormCheckboxControl` | Emits `valueChange` or `checkedChange` without blur or touch. Use `ngMocks.touch` when the control exposes a touch output. |

For classic controls with `updateOn: 'submit'`, a reported touch remains pending until form submission.

When the change already includes blur, another [`ngMocks.trigger`](trigger.md) call is
unnecessary to exercise that blur handler. A dispatched blur event alone does not guarantee
that a custom field becomes touched, and it does not move actual browser focus.
See [`ngMocks.touch`](touch.md) for separate touch interactions and the
[signal-forms guide](/guides/signal-forms.md) for native, CVA, and signal-control examples.
