---
title: isMockValidator
description: Documentation about isMockValidator from ng-mocks library
---

`isMockValidator` is useful when we need to access the callback
which was set via `registerOnValidatorChange`
on a mock object which has implemented `Validator` or `AsyncValidator`,
and to call `__simulateValidatorChange` to trigger it.
It verifies whether an instance respects `MockValidator` interface.

We need it when we get an error like:

> Property '\_\_simulateValidatorChange' does not exist on type &lt;class&gt;

```ts
const instance = ngMocks.findInstance(MyValidatorDirective);
// instance.simulateValidatorChange(); // does not work.
if (isMockValidator(instance)) {
  // now works
  instance.__simulateValidatorChange();
}
```
