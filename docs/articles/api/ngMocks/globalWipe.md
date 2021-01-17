---
title: ngMocks.globalWipe
description: Documentation about ngMocks.globalWipe from ng-mocks library
---

`ngMocks.globalWipe` resets all customizations which have been done by any `ngMocks.default` function.

```ts
ngMocks.defaultMock(Service, () => ({
  stream$: EMPTY,
}));
ngMocks.globalExclude(Component);
ngMocks.globalKeep(Directive);
ngMocks.globalReplace(Pipe, FakePipe);

ngMocks.globalWipe(Service);
ngMocks.globalWipe(Component);
ngMocks.globalWipe(Directive);
ngMocks.globalWipe(Pipe);

// All the things above will be mocked as usual
```
