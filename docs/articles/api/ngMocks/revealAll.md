---
title: ngMocks.revealAll
description: Documentation about ngMocks.revealAll from ng-mocks library
---

Behavior of `ngMocks.revealAll` repeats [`ngMocks.reveal`](reveal.md),
but, instead of returning the first suitable element,
`ngMocks.revealAll` will collect all suitable elements and return all of them.

In a template like:

```html
<app-form>
  <ng-container block="personal">
    <input appInput="firstName">
    <input appInput="lastName">
  </ng-container>
  <ng-container block="address">
    <input appInput="street">
    <input appInput="city">
    <input appInput="country">
  </ng-container>
</app-form>
```

we can get the form, blocks and their inputs like:

```ts
// roots
const formEl = ngMocks.reveal('app-form');
const personalEl = ngMocks.reveal(formEl, ['block', 'personal']);
const addressEl = ngMocks.reveal('app-form', ['block', 'address']);

// 2 elements
const personalEls = ngMocks.revealAll(personalEl, AppInputDirective);

// 3 elements
const addressEls = ngMocks.revealAll(addressEl, AppInputDirective);
```
