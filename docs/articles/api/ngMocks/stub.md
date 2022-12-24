---
title: ngMocks.stub
description: Documentation about `ngMocks.stub` from ng-mocks library
---

`ngMocks.stub` is needed in case if we want to create stub methods / properties of a service.

> If there is an existing value / spy we want to set, then use [`ngMocks.stubMember`](stubMember.md).

- `ngMocks.stub( service, method )`
- `ngMocks.stub( service, methods )`
- `ngMocks.stub( service, property, 'get' | 'set' )`

Returns a mock function / spy of the method. If the method has not been replaced with a stub yet - it will.

```ts
const spy: Function = ngMocks.stub(instance, methodName);
```

Returns a mock function / spy of the property. If the property has not been replaced with a stub yet - it will.

```ts
const spyGet: Function = ngMocks.stub(instance, propertyName, 'get');
const spySet: Function = ngMocks.stub(instance, propertyName, 'set');
```

Or override properties and methods.

```ts
ngMocks.stub(instance, {
  existingProperty: true,
  existingMethod: jasmine.createSpy(),
});
```
