---
title: ngMocks.trigger
description: Documentation about `ngMocks.trigger`, a tool with a simple interface to trigger any events in unit tests
---

`ngMocks.trigger` provides a simple interface which allows to trigger all the variety of events and to customize their properties.

## Common events

For example, a focus event can be triggered like that:

```ts
const el = ngMocks.find('input');
ngMocks.trigger(el, 'focus');
ngMocks.trigger(el, 'blur');
ngMocks.trigger(el, 'mouseleave', {
  x: 1,
  y: 2,
});
```

or simply with selectors which are supported by [`ngMocks.find`](find.md).

```ts
ngMocks.trigger('input[name="address"]', 'focus');
ngMocks.trigger(['name', 'address'], 'blur');
```

## Key combinations

In order to simulate shot keys and test their handlers,
for example, `Control+Shift+Z`:

```ts
const el = ngMocks.find('input');
ngMocks.trigger(el, 'keydown.control.shift.z');
ngMocks.trigger(el, 'keyup.meta.s');
```

## Custom events

Instead of the name of an event, an event object can be passed.
In order to create an event object [`ngMocks.event`](event.md) can be used.

```ts
const el = ngMocks.find('input');
const event = new CustomEvent('my-event');
ngMocks.trigger(el, event);
```
