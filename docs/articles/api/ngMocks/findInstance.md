---
title: ngMocks.findInstance
description: Documentation about ngMocks.findInstance from ng-mocks library
---

Returns the first found component, directive, pipe or service which belongs to the current element or its any child.
If the element is not specified, then the current fixture is used.

- `ngMocks.findInstance( fixture?, directive, notFoundValue? )`
- `ngMocks.findInstance( debugElement?, directive, notFoundValue? )`

or simply with selectors which are supported by [`ngMocks.find`](find.md).

- `ngMocks.findInstance( cssSelector?, directive, notFoundValue? )`

```ts
const directive1 = ngMocks.findInstance(Directive1);
const directive2 = ngMocks.findInstance(fixture, Directive2);
const directive3 = ngMocks.findInstance(fixture.debugElement, Directive3);
const pipe = ngMocks.findInstance(fixture.debugElement, MyPipe);
const service = ngMocks.findInstance(fixture, MyService);
```

```ts
const directive1 = ngMocks.findInstance('div.node', Directive1);
const directive2 = ngMocks.findInstance(['attr'], Directive2);
const directive3 = ngMocks.findInstance(['attr', 'value'], Directive3);
const pipe = ngMocks.findInstance('div span.text', MyPipe);
```
