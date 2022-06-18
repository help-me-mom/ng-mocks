---
title: ngMocks.get
description: Documentation about ngMocks.get from ng-mocks library
---

Returns a declaration, service or token, which can be attribute or structural directives,
which belongs to the current element.

- `ngMocks.get( debugElement, directive, notFoundValue? )`

```ts
const directive = ngMocks.get(fixture.debugElement, Directive);
```

or simply with selectors which are supported by [`ngMocks.find`](./find.md).

```ts
const directive = ngMocks.get('app-component', Directive);
```

## Root providers

If you need to get a root provider, then `ngMocks.get` should be called without the first parameter:

```ts
const appId = ngMocks.get(APP_ID);
```
