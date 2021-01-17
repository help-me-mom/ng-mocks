---
title: getSourceOfMock
description: Documentation about getSourceOfMock from ng-mocks library
---

`getSourceOfMock` returns the origin of a mock class.

```ts
// returns the source class of `MockClass`
const OriginalClass1 = getSourceOfMock(MockClass);

// returns the same class if OriginalClass2 is not a mock
const OriginalClass2 = getSourceOfMock(OriginalClass2);
```
