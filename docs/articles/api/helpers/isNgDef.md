---
title: isNgDef
description: Documentation about isNgDef from ng-mocks library
---

`isNgDef` verifies how a class has been decorated.

```ts
if (isNgDef(SomeClass, 'm')) {
  // SomeClass is a module
}

if (isNgDef(SomeClass, 'c')) {
  // SomeClass is a component
}

if (isNgDef(SomeClass, 'd')) {
  // SomeClass is a directive
}

if (isNgDef(SomeClass, 'p')) {
  // SomeClass is a pipe
}

if (isNgDef(SomeClass, 'i')) {
  // SomeClass is a service
}

if (isNgDef(SomeClass, 't')) {
  // SomeClass is a token
}

if (isNgDef(SomeClass)) {
  // SomeClass is a module or component or directive or pipe or service
}
```
