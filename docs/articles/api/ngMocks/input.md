---
title: ngMocks.input
description: Documentation about ngMocks.input from ng-mocks library
---

Returns value of an `input` of an element.
It avoids the issue of knowing the name of a component / directive the input belongs to.

- `ngMocks.input( debugElement, input, notFoundValue? )`

```ts
const inputValue = ngMocks.input(debugElement, 'param1');
```
