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

It supports both `FormsModule` and `ReactiveFormsModule`.
