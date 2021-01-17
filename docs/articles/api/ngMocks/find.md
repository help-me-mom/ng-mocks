---
title: ngMocks.find
description: Documentation about ngMocks.find from ng-mocks library
---

Returns a found DebugElement which belongs to a component with the correctly typed componentInstance,
or matches a css selector.
If a root element or a fixture are not specified, then the current fixture is used.

- `ngMocks.find( fixture?, component, notFoundValue? )`
- `ngMocks.find( fixture?, cssSelector, notFoundValue? )`
- `ngMocks.find( debugElement?, component, notFoundValue? )`
- `ngMocks.find( debugElement?, cssSelector, notFoundValue? )`

```ts
const element1 = ngMocks.find(Component1);
const element2 = ngMocks.find(fixture, Component2);
const element3 = ngMocks.find(fixture.debugElement, Component3);
```

```ts
const element1 = ngMocks.find('div.con1');
const element2 = ngMocks.find(fixture, 'div.con2');
const element3 = ngMocks.find(fixture.debugElement, 'div.con3');
```
