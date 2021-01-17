---
title: ngMocks.findInstances
description: Documentation about ngMocks.findInstances from ng-mocks library
---

Returns an array of all found components, directives, pipes or services which belong to the current element and all its children.
If the element is not specified, then the current fixture is used.

- `ngMocks.findInstances( fixture?, directive )`
- `ngMocks.findInstances( debugElement?, directive )`

```ts
const directives1 = ngMocks.findInstances(Directive1);
const directives2 = ngMocks.findInstances(fixture, Directive2);
const directives3 = ngMocks.findInstances(fixture.debugElement, Directive3);
const pipes = ngMocks.findInstances(fixture.debugElement, MyPipe);
const services = ngMocks.findInstance(fixture, MyService);
```
