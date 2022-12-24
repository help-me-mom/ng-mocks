---
title: ngMocks.click
description: Documentation about `ngMocks.click`, a simple tool to click any element in unit tests
---

There are several ways how to click an element in Angular unit tests.
However, `.triggerEventHandler` does not respect `disabled` state and does not call a native `click` event.
And `.click` on a `nativeElement` does not allow customizing event properties.

`ngMocks.click` is a simple tool which covers these limitations:

- it respects disabled state
- it allows customizations of events
- it causes native events

```ts
const el = ngMocks.find('a');

// we can click debug elements
ngMocks.click(el);

// we can click native elements
// with custom coordinates
ngMocks.click(el.nativeElement, {
  x: 150,
  y: 150,
});
```

or simply with selectors which are supported by [`ngMocks.find`](find.md).

```ts
ngMocks.click('a');
```
```ts
ngMocks.click('[data-role="link"]');
```
```ts
ngMocks.click(['data-role']);
```
```ts
ngMocks.click(['data-role', 'link']);
```

Under the hood `ngMocks.click` uses [`ngMocks.trigger`](trigger.md),
therefore all features of [`ngMocks.trigger`](trigger.md) can be used.
