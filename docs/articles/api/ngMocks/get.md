---
title: ngMocks.get
description: Documentation about `ngMocks.get` from ng-mocks library
---

Returns a component, directive, service or token, which can be attribute or structural directives,
which belongs to the current element.

- `ngMocks.get( debugElement, Component, notFoundValue? )`

```ts
const component = ngMocks.get(fixture.debugElement, MyComponentType);
```

- `ngMocks.get( debugElement, Directive, notFoundValue? )`

```ts
const directive = ngMocks.get(fixture.debugElement, MyDirectiveType);
```

- `ngMocks.get( Service )`

```ts
const service = ngMocks.get(MyServiceType);
```


or simply with selectors which are supported by [`ngMocks.find`](find.md).

- `ngMocks.get( cssSelector, Directive, notFoundValue? )`
```ts
const directive = ngMocks.get('app-component', MyDirectiveType);
```

- `ngMocks.get( cssSelector, Component, notFoundValue? )`

```ts
const component = ngMocks.get('app-component', AppComponentType);
```

## Root providers

If you need to get a root provider, then `ngMocks.get` should be called without the first parameter:

```ts
const appId = ngMocks.get(APP_ID);
```
