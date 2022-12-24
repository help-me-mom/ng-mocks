---
title: "How to fix TypeError: Cannot read property 'subscribe' of undefined"
description: A solution for Angular tests when they fail with "Cannot read property 'subscribe' of undefined"
sidebar_label: Read property of undefined
---

This issue means that something has been replaced with a mock object and returns a dummy result (`undefined`) instead of observable streams.

There is an answer for this error in the section called [How to mock observables](/extra/mock-observables.md),
if the error has been triggered by a mock service, and its property is of type of `undefined`.

Or you might check [`MockInstance`](/api/MockInstance.md) or [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md)
in the case if the error has been caused by a mock component or a mock directive.

## Angular Material UI

If you are using `ng-mocks` with `Angular Material UI`, and you need to keep a mat module,
but this causes `TypeError: Cannot read properties of undefined (reading 'subscribe')`.

Highly likely, this means that under the hood the kept module is using a root provider which has been mocked,
because `ng-mocks` mocks root providers by default.

To solve that, you have 2 options, skip mocking of root providers, or find out which mock provider causes the issue,
and customize its mock to return `Observable` instead of `undefined`.

### Skip mocking of root providers

To skip mocking of root providers simply
add [`.keep(NG_MOCKS_ROOT_PROVIDERS)`](/api/MockBuilder.md#ng_mocks_root_providers-token)
to your [`MockBuilder`](/api/MockBuilder.md) definition:

```ts
import { MockBuilder, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';

describe('suite', () => {
  beforeEach(() => MockBuilder(YourComponent, ItsModule)
    .keep(MatBadgeModule) // or any other MatModule
    .keep(NG_MOCKS_ROOT_PROVIDERS) // <- the fix
  );
});
```

### To customize a mock

To customize a mock, you can use `EMPTY` and [`ngMocks.defaultMock`](/api/ngMocks/defaultMock.md):

```ts title="src/test.ts"
import { EMPTY } from 'rxjs';
import { ngMocks } from 'ng-mocks';

ngMocks.defaultMock(BreakpointObserver, () => ({
  observe: jasmine.createSpy().and.returnValue(EMPTY),
}));
```
