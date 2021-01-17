---
title: ngMocks.findAll
description: Documentation about ngMocks.findAll from ng-mocks library
---

Returns an array of found DebugElements which belong to a component with the correctly typed componentInstance,
or match a css selector.
If a root element or a fixture are not specified, then the current fixture is used.

- `ngMocks.findAll( fixture?, component )`
- `ngMocks.findAll( fixture?, cssSelector )`
- `ngMocks.findAll( debugElement?, component )`
- `ngMocks.findAll( debugElement?, cssSelector )`

```ts
const elements1 = ngMocks.findAll(Component1);
const elements2 = ngMocks.findAll(fixture, Component2);
const elements3 = ngMocks.findAll(fixture.debugElement, Component3);
```

```ts
const elements1 = ngMocks.findAll('div.item1');
const elements2 = ngMocks.findAll(fixture, 'div.item2');
const elements3 = ngMocks.findAll(fixture.debugElement, 'div.item3');
```
