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

Profit!

`ngMocks.touch` simulates a separate touch interaction without supplying a new value.
It can exercise a native blur handler, a CVA touch callback, or a signal control's touch output.
For `FormValueControl` and `FormCheckboxControl`, the control must expose `touch` in Angular 22.
Angular 21 uses the `touched` model's implicit `touchedChange` output instead.
See the [Angular 22 example](/guides/signal-forms.md#test-a-form-with-a-mocked-signal-control)
for the `touch` output and resulting field state.

For a real CVA with focus or blur handlers on the selected element, those handlers
must report the touch to the form. Otherwise, `ngMocks.touch` can trigger blur while the field
remains untouched. Select the control's interactive element whose blur handler reports touch;
another call does not supply missing touch handling.
