---
title: ngMocks.event
description: Documentation about `ngMocks.event`, a simple interface to create custom events in unit tests
---

`ngMocks.event` solves the legacy of IE11, when an event object cannot be created via `new CustomEvent`, but via `document.createEvent`.

Besides that, `ngMocks.event` provides a simple interface to customize the event properties.

```ts
const event = ngMocks.event('click', {
  x: 1,
  y: 2,
});
```

The created event can be dispatched via [`ngMocks.trigger`](trigger.md#custom-events).
