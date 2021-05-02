---
title: ngMocks.get
description: Documentation about ngMocks.get from ng-mocks library
---

Returns an attribute or structural directive which belongs to the current element.

- `ngMocks.get( debugElement, directive, notFoundValue? )`

```ts
const directive = ngMocks.get(fixture.debugElement, Directive);
```

or simply with selectors which are supported by [`ngMocks.find`](./find.md).

```ts
const directive = ngMocks.get('app-component', Directive);
```
