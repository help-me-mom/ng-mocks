---
title: How to test a provider of a component in Angular application
description: Covering a provider of an Angular component with tests
sidebar_label: Provider of component
---

If we have a component with providers for testing, we need to mock everything
except the provider:

```ts
beforeEach(() => MockBuilder(TargetService, TargetComponent));
```

This code will set up `TestBed` with a mocked copy of `TargetComponent`, but leave `TargetService` as it is,
so we would be able to assert it.

In the test we need to render the mocked component, find its element in the fixture and extract the service from the element.
If we use [`MockRender`](https://www.npmjs.com/package/ng-mocks#mockrender) we can access the element of the component via `fixture.point`.

```ts
const fixture = MockRender(TargetComponent);
const service = fixture.point.injector.get(TargetService);
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestProviderInComponent/test.spec.ts&initialpath=%3Fspec%3DTestProviderInComponent)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestProviderInComponent/test.spec.ts&initialpath=%3Fspec%3DTestProviderInComponent)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestProviderInComponent/test.spec.ts"
import { Component, Injectable } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value = 'target';
}

@Component({
  providers: [TargetService],
  selector: 'target',
  template: '{{ service.value }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetService) {}
}

describe('TestProviderInComponent', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder.
  // Because we do not care about TargetComponent, we pass it as
  // the second parameter for being replaced with a mock copy.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetComponent));

  it('has access to the service via a component', () => {
    // Let's render the mock component. It provides a point
    // to access the service.
    const fixture = MockRender(TargetComponent);

    // The component's element is fixture.point.
    // Now we can use ngMocks.get to extract internal services.
    const service = ngMocks.get(fixture.point, TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual('target');
  });
});
```
