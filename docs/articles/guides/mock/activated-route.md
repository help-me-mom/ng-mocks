---
title: How to mock ActivatedRoute in Angular tests
description: Mocking ActivatedRoute snapshots and params in Angular tests
sidebar_label: ActivatedRoute
---

When mocking `ActivatedRoute`, the goal is usually to provide stub route data
for the component under test.

## ActivatedRoute.snapshot

Let's assume we have a `TargetComponent` which relies on the `paramId`
from `ActivatedRoute.snapshot`.

```ts
@Component({
  selector: 'target',
  template: '{{ param }}',
})
class TargetComponent {
  public param: string | null = null;

  public constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.param = this.route.snapshot.paramMap.get('paramId');
  }
}
```

In the test, we want `ActivatedRoute` to provide `paramValue` as `paramId`.
To do so, we can use [`MockInstance`](/api/MockInstance.md).

The idea is to mock the `snapshot` getter and return stub params from it:

```ts
it('works with snapshot from ActivatedRoute', () => {
  MockInstance(ActivatedRoute, 'snapshot', jasmine.createSpy(), 'get')
    .and.returnValue({
      paramMap: new Map([['paramId', 'paramValue']]),
    });
  // in case of jest
  // MockInstance(ActivatedRoute, 'snapshot', jest.fn(), 'get')
  //   .mockReturnValue({
  //     paramMap: new Map([['paramId', 'paramValue']]),
  //   });

  // the rest of the test
  // ...
});
```

Now any access to `ActivatedRoute.snapshot` returns a stub `paramMap`
with the params we need.

## ActivatedRoute.params

If a component relies on `ActivatedRoute.params`, the setup is very similar:

```ts
it('works with params from ActivatedRoute', () => {
  MockInstance(ActivatedRoute, 'params', jasmine.createSpy(), 'get')
    .and.returnValue(of({ paramId: 'paramValue' }));
  // in case of jest
  // MockInstance(ActivatedRoute, 'params', jest.fn(), 'get')
  //   .mockReturnValue(of({ paramId: 'paramValue' }));

  // the rest of the test
  // ...
});
```

## RouterModule.forRoot

If you want to mock a module which imports `RouterModule.forRoot`,
keep only the component under test:

```ts
// TargetModule and RouterModule.forRoot will be mocks
beforeEach(() => MockBuilder(
  TargetComponent, // keep
  TargetModule, // mock
));
```

## RouterModule.forChild

If you want to mock a module which imports `RouterModule.forChild`,
you also need to add `RouterModule.forRoot` to the mocks.

Otherwise, `ActivatedRoute` and other router dependencies will not be available:

```ts
// TargetModule, RouterModule.forChild and RouterModule.forRoot will be mocks
beforeEach(() => MockBuilder(
  TargetComponent, // keep
  [TargetModule, RouterModule.forRoot([])], // mock, add here RouterModule.forRoot([])
));
```

## Live example how to mock ActivatedRoute

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockActivatedRoute/test.spec.ts&initialpath=%3Fspec%3DMockActivatedRoute)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockActivatedRoute/test.spec.ts&initialpath=%3Fspec%3DMockActivatedRoute)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockActivatedRoute/test.spec.ts"
import { Component, NgModule, OnInit } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';

import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';

@Component({
  selector: 'route',
  template: '{{ param }}',
})
class RouteComponent implements OnInit {
  public param: string | null = null;

  public constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.param = this.route.snapshot.paramMap.get('paramId');
  }
}

@NgModule({
  declarations: [RouteComponent],
  imports: [
    RouterModule.forRoot([
      {
        path: 'test/:paramId',
        component: RouteComponent,
      },
    ]),
  ],
})
class TargetModule {}

describe('MockActivatedRoute', () => {
  // Resets customizations after each test, in our case of `ActivatedRoute`.
  MockInstance.scope();

  // Keeping RouteComponent as it is and mocking all declarations in TargetModule.
  beforeEach(() => MockBuilder(RouteComponent, TargetModule));

  it('uses paramId from ActivatedRoute', () => {
    // Let's set the params of the snapshot.
    MockInstance(
      ActivatedRoute,
      'snapshot',
      jasmine.createSpy(),
      'get',
    ).and.returnValue({
      paramMap: new Map([['paramId', 'paramValue']]),
    });
    // in case of jest
    // MockInstance(
    //   ActivatedRoute,
    //   'snapshot',
    //   jest.fn(),
    //   'get',
    // ).mockReturnValue({
    //   paramMap: new Map([['paramId', 'paramValue']]),
    // });

    // Rendering RouteComponent.
    const fixture = MockRender(RouteComponent);

    // Asserting it got the right paramId.
    expect(fixture.point.componentInstance.param).toEqual(
      'paramValue',
    );
  });
});
```
