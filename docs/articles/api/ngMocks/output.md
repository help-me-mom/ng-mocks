---
title: ngMocks.output
description: Documentation about ngMocks.output from ng-mocks library
---

Returns an emitter of an `output` of an element.
It avoids the issue of knowing the name of a component / directive the output belongs to.

- `ngMocks.output( debugElement, output, notFoundValue? )`

```ts
const outputEmitter = ngMocks.output(debugElement, 'update');
```
