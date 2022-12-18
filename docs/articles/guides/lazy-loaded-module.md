---
title: How to test declarations of lazy loaded modules in Angular
description: An example how to mock a lazy loaded module and test its declarations  
sidebar_label: Lazy loaded modules
---

The process of testing declarations of a lazy loaded module is the same
as testing declarations of regular modules. However, we might need declarations from the parent module
which loads the lazy loaded module.

For such a case, [`MockBuilder`](../api/MockBuilder.md) supports an array of modules as the second parameter.
There we can provide the lazy loaded module and its parent module.

```ts
beforeEach(() => MockBuilder(LazyComponent, [AppModule, LazyModule]));
```

Now all declarations in `AppModule` will be mocked and exported.
The same happens with declarations in `LazyModule` except `LazyComponent`.

```ts
it('renders LazyComponent', () => {
  const fixture = MockRender(Component1);
  expect(ngMocks.formatText(fixture)).toEqual('lazy-loaded');
});
```

Profit.

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestLazyModule/test.spec.ts&initialpath=%3Fspec%3DTestLazyModule)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestLazyModule/test.spec.ts&initialpath=%3Fspec%3DTestLazyModule)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestLazyModule/test.spec.ts"
import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { LazyComponent, LazyModule } from './lazy-module';

@Component({
  selector: 'target',
  template: '<router-outlet></router-outlet>',
})
class AppComponent {}

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forRoot([
    {
      loadChildren: () => import('./lazy-module').then(module => module.LazyModule),
      path: '',
    },
  ])],
})
class AppModuleRouting {}

@NgModule({
  bootstrap: [AppComponent],
  declarations: [AppComponent],
  imports: [AppModuleRouting],
})
class AppModule {}

describe('TestLazyModule', () => {
  beforeEach(() =>
    MockBuilder(LazyComponent, [AppModule, LazyModule]),
  );

  it('renders lazy component', () => {
    const fixture = MockRender(LazyComponent);
    expect(ngMocks.formatText(fixture)).toEqual('lazy-component');
  });
});
```
