---
title: ngMocks.reveal
description: Documentation about `ngMocks.reveal` from ng-mocks library
---

There are `ng-container` and `ng-template` besides normal html elements in Angular.

But, the problem is that [`ngMocks.find`](find.md) and [`ngMocks.findAll`](findAll.md), which use `debugElement.query` and `debugElement.queryAll`,
can find neither `ng-container` nor `ng-template`.

However, a wish to assert on the content of a `ng-container` never leaves the head.
Likewise, a wish to get a `ng-template` and to render it with a custom context, just because it is a test.

**Here we go!** `ngMocks.reveal` has been made for that.
It is like [`ngMocks.find`](find.md) and [`ngMocks.findAll`](findAll.md),
but its **queries are based on Angular declarations** instead of css and html.

Now, if we had a template like that:

```html
<div>
  <ng-container tpl="header">
    <div>header</div>
  </ng-container>
  <ng-container tpl="footer">
    <div>footer</div>
  </ng-container>
</div>
```

We can extract exactly what we wanted:

```ts
const header = ngMocks.reveal(['tpl', 'header']);
const footer = ngMocks.reveal(['tpl', 'footer']);

ngMocks.formatHtml(header);
// returns
// <div>header</div>

ngMocks.formatHtml(footer);
// returns
// <div>footer</div>
```

## Not found value

By default, `ngMocks.reveal` throws an error if the desired element cannot be found,
but it can be changed via providing an additional parameter after the desired selector,
if the desired element cannot be found, then the provided value is returned.

```ts
const el = ngMocks.reveal('never-possible', undefined);
// el === undefined;

ngMocks.reveal('never-possible');
// throws
```

## Narrowing context

`ngMocks.reveal` supports `ComponentFixture`, `DebugElements`, `DebugNodes`
and selectors which are supported by [`ngMocks.find`](find.md).
If none has been provided, then the latest known fixture is used.

In a template like:

```html
<input appInput>
<app-form>
  <input appInput>
</app-form>
<input appInput>
```

We can query elements like that:

```ts
// searches in the latest fixture
const input1El = ngMocks.reveal(['appInput']);

// searches in the provided fixture
const formEl = ngMocks.reveal(fixture, 'app-form');

// searches inside of formEl
const input2El = ngMocks.reveal(formEl, ['appInput']);

// searches inside of app-form
const input3El = ngMocks.reveal('app-form', ['appInput']);
```

:::important
If you use css selectors to narrow context,
then please pay attention that the first parameter is a css selector,
whereas the second one is a special selector for this helper.
Although they look the same.   
:::

## Query by declaration

Returns an element which belongs to a component or directive.

In a template like:

```html
<app-form>
  <input appInput>
</app-form>
```

We can get the form and the input like that:

```ts
const appFormEl = ngMocks.reveal(AppFormComponent);
const inputEl = ngMocks.reveal(AppInputDirective);
```

## Query by nodeName

Returns an element which belongs to a component or a directive
which selectors include the desired value.

In a template like:

```html
<app-form>
  <input appInput>
</app-form>
```

We can get the form and the input like that:

```ts
const appFormEl = ngMocks.reveal('app-form');
// works only if the selector of AppFormComponent
// includes 'app-form' 

const inputEl = ngMocks.reveal('input');
// works only if the selector of AppInputDirective
// includes 'input'
```

## Query by attribute

Returns an element which belongs to a component or a directive
which selectors or inputs include the desired value.

**Pay attention to a tuple structure.**

In a template like:

```html
<app-form [value]="value">
  <input appInput>
</app-form>
```

We can get the form and the input like that:

```ts
const appFormEl = ngMocks.reveal(['value']);

const inputEl = ngMocks.reveal(['appInput']);
```

## Query by attribute and its value

Time to time, we want to distinguish elements by a provided value.
Then a tuple with the desired value should be used.

In a template like:

```html
<ng-template tpl="header">footer</ng-template>
<ng-template tpl="footer">footer</ng-template>
```

We can get both of the templates like:

```ts
const header = ngMocks.reveal(['tpl', 'header']);
const footer = ngMocks.reveal(['tpl', 'footer']);
```

## Query by id

Also, we can query by ids. Simply prefix the desired id with `#`.

In a template like:

```html
<app-form #form>
  <input #input>
</app-form>
```

We can get the form and the input like that:

```ts
const appFormEl = ngMocks.reveal('#form');

const inputEl = ngMocks.reveal('#input');
```
