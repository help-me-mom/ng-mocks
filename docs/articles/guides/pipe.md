---
title: How to test a pipe in Angular application
description: Covering an Angular pipe with tests
sidebar_label: Pipe
---

An approach with testing pipes is similar to directives. We pass the pipe as the first parameter of [`MockBuilder`](https://www.npmjs.com/package/ng-mocks#mockbuilder),
and its module with dependencies as the second one if they exist:

```ts
beforeEach(() => MockBuilder(TargetPipe));
```

To verify how the pipe behaves we need to render a custom template:

```ts
const fixture = MockRender(TargetPipe, {
  $implicit: ['1', '3', '2'],
});
```

Now we can assert what has been rendered:

```ts
expect(fixture.nativeElement.innerHTML).toEqual('1, 2, 3');
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestPipe/test.spec.ts&initialpath=%3Fspec%3DTestPipe)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestPipe/test.spec.ts&initialpath=%3Fspec%3DTestPipe)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestPipe/test.spec.ts"
import { Pipe, PipeTransform } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A simple pipe that accepts an array of strings, sorts them,
// and returns a joined string of the values.
@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  public transform(value: string[], asc = true): string {
    let result = [...(value || [])].sort();
    if (!asc) {
      result = result.reverse();
    }

    return result.join(', ');
  }
}

describe('TestPipe', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the pipe, we pass it as the first
  // parameter of MockBuilder. We can omit the second parameter,
  // because there are no dependencies.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetPipe));

  it('sorts strings', () => {
    const fixture = MockRender(TargetPipe, {
      $implicit: ['1', '3', '2'],
    });

    expect(fixture.nativeElement.innerHTML).toEqual('1, 2, 3');
  });

  it('reverses strings on param', () => {
    const fixture = MockRender('{{ values | target:flag }}', {
      flag: false,
      values: ['1', '3', '2'],
    });

    expect(fixture.nativeElement.innerHTML).toEqual('3, 2, 1');
  });
});
```
