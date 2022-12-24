---
title: ngMocks.input
description: Documentation about `ngMocks.input` from ng-mocks library
---

Returns value of an `input` of an element.
It avoids the issue of knowing the name of a component / directive the input belongs to.

- `ngMocks.input( debugElement, input, notFoundValue? )`

or simply with selectors which are supported by [`ngMocks.find`](find.md).

- `ngMocks.input( cssSelector, input, notFoundValue? )`

```ts
const inputValue = ngMocks.input(debugElement, 'param1');
```
```ts
const inputValue = ngMocks.input('app-component', 'param1');
```
