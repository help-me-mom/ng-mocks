---
title: ngMocks.findInstances
description: Documentation about ngMocks.findInstances from ng-mocks library
---

Returns an array of all found components, directives, pipes or services which belong to matched elements and all its children.
If the element is not specified, then the current fixture is used.

- `ngMocks.findInstances( fixture?, directive )`
- `ngMocks.findInstances( debugElement?, directive )`

or simply with selectors which are supported by [`ngMocks.find`](find.md).

- `ngMocks.findInstances( cssSelector?, directive )`

```ts
const directives1 = ngMocks.findInstances(Directive1);
const directives2 = ngMocks.findInstances(fixture, Directive2);
const directives3 = ngMocks.findInstances(fixture.debugElement, Directive3);
const pipes = ngMocks.findInstances(fixture.debugElement, MyPipe);
const services = ngMocks.findInstance(fixture, MyService);
```

```ts
const directives1 = ngMocks.findInstances('div.node', Directive1);
const directives2 = ngMocks.findInstances(['attr'], Directive2);
const directives3 = ngMocks.findInstances(['attr', 'value'], Directive3);
const pipes = ngMocks.findInstances('div span.text', MyPipe);
```

:::important
A css selector helps to find instances in all matched `DebugElements`.
Therefore, the same instance can be found several times via nested `DebugElements` with the same selector.
In this case, the instance will be added to the returning array only once.  
:::
