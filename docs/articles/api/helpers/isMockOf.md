---
title: isMockOf
description: Documentation about isMockOf from ng-mocks library
---

`isMockOf` helps when we want to use `ng-mocks` tools for rendering,
but typescript does not recognize an `instance` as a mock object.

We need this when we get an error like:

> Property '\_\_render' does not exist on type &lt;class&gt;

> Property '\_\_hide' does not exist on type &lt;class&gt;

```ts
// checks whether `instance` is
// an instance of `MockedModule<SomeClass>`
if (isMockOf(instance, SomeClass, 'm')) {
  // yes it is
}

// checks whether `instance` is
// an instance of `MockedComponent<SomeClass>`
if (isMockOf(instance, SomeClass, 'c')) {
  // yes it is
}

// checks whether `instance` is
// an instance of `MockedDirective<SomeClass>`
if (isMockOf(instance, SomeClass, 'd')) {
  // yes it is
}

// checks whether `instance` is
// an instance of `MockedPipe<SomeClass>`
if (isMockOf(instance, SomeClass, 'p')) {
  // yes it is
}

// checks whether `instance` is
// an instance of mock `SomeClass`
if (isMockOf(instance, SomeClass, 'p')) {
  // yes it is
}
```
