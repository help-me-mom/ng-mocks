---
title: 'How to fix Error: Directive has no selector, please add it!'
description: A solution how to test components and directives without selectors in Angular
sidebar_label: No selector
---

This issue means that a module imports a declaration (usually a parent class) which does not have a selector.
Such directives and components are created during a [migration](https://angular.io/guide/migration-undecorated-classes)
if their parent classes have not been decorated yet.

The right fix is to remove these declarations from modules, only final classes should be specified in there.

If you cannot remove them for a reason, for example, it is a 3rd-party library,
then you need to write tests with usage of [`MockBuilder`](/api/MockBuilder.md) and its [`.exclude`](/api/MockBuilder.md#exclude) feature.

```ts
beforeEach(() => {
  return MockBuilder(MyComponent, MyModule)
    .exclude(ParentDirective);
});
```

That fixes declarations of the module and resolves the error,
a directive without a selector has been gone from the module definition.
