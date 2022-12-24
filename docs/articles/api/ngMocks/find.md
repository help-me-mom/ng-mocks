---
title: ngMocks.find
description: Documentation about `ngMocks.find` from ng-mocks library
---

Returns a found DebugElement which belongs to a component with the correctly typed componentInstance,
or matches a css selector.
If a root element or a fixture are not specified, then the current fixture is used.

- `ngMocks.find( fixture?, component, notFoundValue? )`
- `ngMocks.find( fixture?, cssSelector, notFoundValue? )`
- `ngMocks.find( debugElement?, component, notFoundValue? )`
- `ngMocks.find( debugElement?, cssSelector, notFoundValue? )`

## Component class

```ts
const element1 = ngMocks.find(Component1);
const element2 = ngMocks.find(fixture, Component2);
const element3 = ngMocks.find(fixture.debugElement, Component3);
```

## CSS Selector

```ts
const element1 = ngMocks.find('div.con1');
const element2 = ngMocks.find(fixture, 'div.con2');
const element3 = ngMocks.find(fixture.debugElement, 'div.con3');
```

## Tuple

`cssSelector` supports a tuple to generate an attribute css selector.
The first value is the name of an attribute,
the second value is optional and points to the desired value of the attribute.  

```ts
const el1 = ngMocks.find(['data-key']);
// the same as
const el2 = ngMocks.find('[data-key]');

el1 === el2; // true
```

```ts
const el1 = ngMocks.find(['data-key', 5]);
// the same as
const el2 = ngMocks.find('[data-key="5"]');

el1 === el2; // true
```
