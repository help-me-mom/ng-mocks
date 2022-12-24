---
title: How to test a standalone pipe in Angular application
description: Covering an Angular standalone pipe with tests
sidebar_label: Standalone Pipe
---

A standalone pipe doesn't have many differences comparing to a regular pipe.
It cannot import any dependencies, it can only inject root providers.
In order to mock root providers, [`MockBuilder`](/api/MockBuilder.md#shallow-flag) can be used.

Let's image we have the next standalone pipe:

```ts
@Pipe({
  name: 'standalone',
  standalone: true,
})
class StandalonePipe implements PipeTransform {
  constructor(public readonly rootService: RootService) {}

  transform(value: string): string {
    return this.rootService.trigger(value);
  }
}
```

As we see, it injects `RootService`, which should be mocked in unit tests.

It's possible to configure with the next code:

```ts
beforeEach(() => {
  return MockBuilder(StandalonePipe);
});
```

Now all root dependencies of `StandalonePipe` are mocks,
and the properties, methods, injections of the pipe are available for testing.

If you need to keep a dependency, simply call [`.keep`](/api/MockBuilder.md#keep) with it.
For example, if we wanted to keep `RootService` then the code would look like:

```ts
beforeEach(() => {
  return MockBuilder(StandalonePipe).keep(RootService);
});
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestStandalonePipe/test.spec.ts&initialpath=%3Fspec%3DTestStandalonePipe)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestStandalonePipe/test.spec.ts&initialpath=%3Fspec%3DTestStandalonePipe)

```ts title="https://github.com/help-me-mom/ng-mocks/tree/master/examples/TestStandalonePipe/test.spec.ts"
import {
  Injectable,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

// A root service we want to mock.
@Injectable({
  providedIn: 'root',
})
class RootService {
  trigger(name: string) {
    // does something very cool

    return name;
  }
}

// A standalone pipe we are going to test.
@Pipe({
  name: 'standalone',
  standalone: true,
})
class StandalonePipe implements PipeTransform {
  constructor(public readonly rootService: RootService) {}

  transform(value: string): string {
    return this.rootService.trigger(value);
  }
}

describe('TestStandalonePipe', () => {
  // It creates a context for mocks which will be reset after each test.
  MockInstance.scope();

  beforeEach(() => {
    return MockBuilder(StandalonePipe);
  });

  it('renders dependencies', () => {
    // Customizing what RootService does.
    MockInstance(
      RootService,
      'trigger',
      jasmine.createSpy(),
    ).and.returnValue('mock');

    // Rendering the pipe.
    const fixture = MockRender(StandalonePipe, {
      $implicit: 'test',
    });

    // Asserting that StandalonePipe calls RootService.trigger.
    const rootService = ngMocks.findInstance(RootService);
    // It's possible because of autoSpy.
    expect(rootService.trigger).toHaveBeenCalledWith('test');

    // Asserting that StandalonePipe has rendered the result of the RootService
    expect(ngMocks.formatText(fixture)).toEqual('mock');
  });
});
```
