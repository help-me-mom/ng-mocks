---
title: isMockControlValueAccessor
description: Documentation about isMockControlValueAccessor from ng-mocks library
---

`isMockControlValueAccessor` helps when we need to access callbacks
which were set via `registerOnChange` and `registerOnTouched`
on a mock object which has implemented `ControlValueAccessor`,
and to call `__simulateChange`, `__simulateTouch` to trigger them.
It verifies whether an instance respects `MockControlValueAccessor` interface.

We need it when we get an error like:

> Property '\_\_simulateChange' does not exist on type &lt;class&gt;

> Property '\_\_simulateTouch' does not exist on type &lt;class&gt;

```ts
const instance = ngMocks.findInstance(MyCustomFormControl);
// instance.__simulateChange('foo'); // does not work.
if (isMockControlValueAccessor(instance)) {
  // now works
  instance.__simulateChange('foo');
  instance.__simulateTouch();
}
```
