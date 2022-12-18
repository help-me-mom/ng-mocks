---
title: How to test a standalone directive in Angular application
description: Covering an Angular standalone directive with tests
sidebar_label: Standalone Directive
---

Here you can find how to test a standalone directive.

A standalone directive has the same feature set as a regular directive.
The only possible dependencies for a standalone directive are root services and tokens. 
In a unit test, developers prefer to mock such dependencies.
[`MockBuilder`](../api/MockBuilder.md#shallow-flag) helps to configure `TestBed` in such the way.

Let's image we have the next standalone directive:

```ts
@Directive({
  selector: 'standalone',
  standalone: true,
})
class StandaloneDirective implements OnInit {
  @Input() public readonly name: string | null = null;

  constructor(public readonly rootService: RootService) {}

  ngOnInit(): void {
    this.rootService.trigger(this.name);
  }
}
```

As we can see, the standalone directive injects `RootService`, and, ideally, the service should be mocked.

To configure `TestBed` for that you need to use the next code:

```ts
beforeEach(() => {
  return MockBuilder(StandaloneDirective);
});
```

Under the hood it marks `StandaloneDirective` as [kept](../api/MockBuilder.md#keep)
and sets [shallow](../api/MockBuilder.md#shallow-flag) and [export](../api/MockBuilder.md#export-flag) flags:

```ts
beforeEach(() => {
  return MockBuilder().keep(StandaloneDirective, {
    shallow: true,
    export: true,
  });
});
```

Now all dependencies of `StandaloneDirective` are mocks,
and the properties, methods, injections of the directive are available for testing.

If you need to keep a dependency, simply call [`.keep`](../api/MockBuilder.md#keep) with it.
For example, if we wanted to keep `RootService` then the code would look like:

```ts
beforeEach(() => {
  return MockBuilder(StandaloneDirective).keep(RootService);
});
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestStandaloneDirective/test.spec.ts&initialpath=%3Fspec%3DTestStandaloneDirective)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestStandaloneDirective/test.spec.ts&initialpath=%3Fspec%3DTestStandaloneDirective)

```ts title="https://github.com/help-me-mom/ng-mocks/tree/master/examples/TestStandaloneDirective/test.spec.ts"
import {
  Directive,
  Injectable,
  Input,
  OnInit,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A root service we want to mock.
@Injectable({
  providedIn: 'root',
})
class RootService {
  trigger(name: string | null) {
    // does something very cool

    return name;
  }
}

// A standalone directive we are going to test.
@Directive({
  selector: 'standalone',
  standalone: true,
})
class StandaloneDirective implements OnInit {
  @Input() public readonly name: string | null = null;

  constructor(public readonly rootService: RootService) {}

  ngOnInit(): void {
    this.rootService.trigger(this.name);
  }
}

describe('TestStandaloneDirective', () => {
  beforeEach(() => {
    return MockBuilder(StandaloneDirective);
  });

  it('renders dependencies', () => {
    // Rendering the directive.
    MockRender(StandaloneDirective, {
      name: 'test',
    });

    // Asserting that StandaloneDirective calls RootService.trigger.
    const rootService = ngMocks.findInstance(RootService);
    // it's possible because of autoSpy.
    expect(rootService.trigger).toHaveBeenCalledWith('test');
  });
});
```
