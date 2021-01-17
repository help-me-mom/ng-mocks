---
title: isMockedNgDefOf
description: Documentation about isMockedNgDefOf from ng-mocks library
---

`isMockedNgDefOf` helps when we need to verify that a class is actually a mock class.

```ts
// checks whether `MockClass` is
// a mock class of `SomeClass` and a module
if (isMockedNgDefOf(MockClass, SomeClass, 'm')) {
  // yes, it is
}

// checks whether `MockClass` is
// a mock class of `SomeClass` and a component
if (isMockedNgDefOf(MockClass, SomeClass, 'c')) {
  // yes, it is
}

// checks whether `MockClass` is
// a mock class of `SomeClass` and a directive
if (isMockedNgDefOf(MockClass, SomeClass, 'd')) {
  // yes, it is
}

// checks whether `MockClass` is
// a mock class of `SomeClass` and a pipe
if (isMockedNgDefOf(MockClass, SomeClass, 'p')) {
  // yes, it is
}

// checks whether `MockClass` is
// a mock class of `SomeClass`
if (isMockedNgDefOf(MockClass, SomeClass)) {
  // yes, it is
}
```
