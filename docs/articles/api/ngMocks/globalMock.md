---
title: ngMocks.globalMock
description: Documentation about ngMocks.globalMock from ng-mocks library
---

`ngMocks.globalMock` marks declarations, services and tokens to be mocked if they appear in kept modules during creating mock modules.

The best place to do that is in `src/test.ts` for `jasmine` or in `src/setup-jest.ts` / `src/test-setup.ts` for `jest`.

Let's mark the `APP_URL` token in order to be mocked in its kept modules.

```ts title="src/test.ts"
ngMocks.globalKeep(AppModule);
ngMocks.globalMock(APP_URL);
ngMocks.defaultMock(APP_URL, () => 'mock');
```

```ts title="src/test.spec.ts"
// ...
MockModule(AppModule);
// ...
const url = TestBed.inject(APP_URL);
// ...
```

The `url` is `mock`.

## Runtime `inject()` dependencies

`ngMocks.globalMock` also marks tokens that are only discovered at runtime through Angular's `inject()` function.
This avoids repeating the token in every `MockBuilder` call.

Configure the token once in `src/test.ts`, `src/setup-jest.ts`, or `src/test-setup.ts`:

```ts
ngMocks.globalMock(BASE_PATH);
ngMocks.defaultMock(BASE_PATH, () => '/api/test-path');
```

The configured value is then available whenever `MockBuilder` keeps a component, directive, or pipe that injects the token:

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/ngMocksGlobalMock/test.spec.ts&initialpath=%3Fspec%3DngMocks.globalMock%3Ainject)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/ngMocksGlobalMock/test.spec.ts&initialpath=%3Fspec%3DngMocks.globalMock%3Ainject)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/ngMocksGlobalMock/test.spec.ts"
import { Component, inject, InjectionToken } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const BASE_PATH = new InjectionToken<string>('BASE_PATH');

@Component({
  selector: 'target-global-mock',
  standalone: true,
  template: '',
})
class TargetComponent {
  public readonly basePath = inject(BASE_PATH);
}

describe('ngMocks.globalMock:inject', () => {
  beforeAll(() => {
    ngMocks.globalMock(BASE_PATH);
    ngMocks.defaultMock(BASE_PATH, () => '/api/test-path');
  });
  afterAll(() => {
    ngMocks.globalWipe(BASE_PATH);
    ngMocks.defaultMock(BASE_PATH);
  });

  beforeEach(() => MockBuilder(TargetComponent));

  it('uses the global default for a runtime inject token', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.point.componentInstance.basePath).toEqual(
      '/api/test-path',
    );
  });
});
```
