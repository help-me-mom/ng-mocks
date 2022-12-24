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
ngMocks.touch(valueAccessorEl);

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
