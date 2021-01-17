---
title: ngMocks.stubMember
description: Documentation about ngMocks.stubMember from ng-mocks library
---

`ngMocks.stubMember` facilitates **injection of existing spies** or defined values **into instances**.

```ts
// overriding the method
ngMocks.stubMember(service, method, customCallback);

// overriding the property's value
ngMocks.stubMember(service, property, customValue);

// overrding the getter, does not touch the existing setter
ngMocks.stubMember(service, property, customGetter, 'get');

// overrding the setter, does not touch the existing getter
ngMocks.stubMember(service, property, customSetter, 'set');
```

It returns the passed value, therefore, this allows **fast chains for spies** and mocks.

```ts
ngMocks.stubMember(service, 'handler', jasmine.createSpy('handler'))
  .and.returnValue('fake');

ngMocks.stubMember(service, 'read', jasmine.createSpy('read'), 'set')
  .and.toThrowError();
```

If we need to stub a method of a service in Angular tests:

```ts
const service = TestBed.inject(Service);
ngMocks.stubMember(service, 'handler', () => 'fake');
// service.handler() === 'fake'
```

If we need to stub a property of a component in Angular tests:

```ts
const component = TestBed.createComponent(Component)
  .componentInstance;
ngMocks.stubMember(service, 'name', 'mock');
// service.name === 'mock'
```

If we need to stub a getter in Angular tests:

```ts
const service = TestBed.inject(Service);
ngMocks.stubMember(service, 'name', () => 'mock', 'get');
// service.name === 'mock'
```

If we need to stub a setter in Angular tests:

```ts
const service = TestBed.inject(Service);
let value: any;
ngMocks.stubMember(service, 'name', v => (value = v), 'set');
// value === undefined
service.name = 'fake';
// value === 'fake'
```
