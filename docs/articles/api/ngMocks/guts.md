---
title: ngMocks.guts
description: Documentation about `ngMocks.guts` from ng-mocks library
---

Generates and returns metadata for `TestBed` module.

- `ngMocks.guts( MyDeclaration, ItsModule )`
- `ngMocks.guts( [Thing1, Thing2], [ToMock1, ToMock2], [Skip1, Skip2] )`

The first parameter can be a declaration or array of them which we want to test.
The second parameter can be a declaration or array of them out of which we want to create mocks.
The third parameter can be a declaration or array of them which we want to exclude.
They support: Modules, Components, Directives, Pipes, Services and tokens.

If there is a module in the second parameter, then its guts will be replaced with their mocks excluding things from the first parameter.
Any parameter might be `null` if we need to skip it.

```ts
const ngModuleMeta = ngMocks.guts(Component, ItsModule);
```

```ts
const ngModuleMeta = ngMocks.guts(
  [Component1, Component2, Service3],
  [ModuleToMock, DirectiveToMock, WhateverToMock],
  [ServiceToExclude, DirectiveToExclude],
);
```

```ts
const ngModuleMeta = ngMocks.guts(
  null,
  ModuleToMock,
  ComponentToExclude,
);
```
