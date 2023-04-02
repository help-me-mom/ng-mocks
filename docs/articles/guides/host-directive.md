---
title: How to test a host directive in Angular application
description: Covering an Angular host directive with tests
sidebar_label: Host Directive
---

Let's imagine we have a component with a host directive which adds the `name` attribute.

The code of the directive:

```ts
@Directive({
  selector: 'host',
  standalone: true,
})
class HostDirective {
  @HostBinding('attr.name') @Input() input?: string;
}
```

The code of the component:

```ts
@Component({
  selector: 'target',
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['input'],
    },
  ],
  template: 'target',
})
class TargetComponent {
  // tons of logic we want to ignore
}
```

The component can be heavy, and, in an ideal test, the logic of the component should be ignored,
so the focus would stay on the directive and how it behaves.

[`MockBuilder`](../api/MockBuilder.md) knows how to mock the component
and how to keep one or some of its host directives as they are.

In order to do so, the host directive should be kept, and its component should be mocked:

```ts
beforeEach(() => MockBuilder(HostDirective, TargetComponent));
```

Profit!

To access the directive in a test, [`ngMocks.findInstnace`](../api/ngMocks/findInstance.md) can be used.

```ts
it('keeps host directives', () => {
  const fixture = MockRender(TargetComponent, { input: 'test' });

  const directive = ngMocks.findInstance(HostDirective);
  expect(directive.input).toEqual('test');
  expect(ngMocks.formatHtml(fixture)).toContain(' name="test"');
});
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestHostDirective/test.spec.ts&initialpath=%3Fspec%3DTestHostDirective)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestHostDirective/test.spec.ts&initialpath=%3Fspec%3DTestHostDirective)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestHostDirective/test.spec.ts"
import {
  Component,
  Directive,
  HostBinding,
  Input,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: 'host',
  standalone: true,
})
class HostDirective {
  @HostBinding('attr.name') @Input() input?: string;

  public hostTestHostDirective() {}
}

@Component({
  selector: 'target',
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['input'],
    },
  ],
  template: 'target',
})
class TargetComponent {
  public targetTestHostDirective() {}
}

describe('TestHostDirective', () => {
  beforeEach(() => MockBuilder(HostDirective, TargetComponent));

  it('keeps host directives', () => {
    const fixture = MockRender(TargetComponent, { input: 'test' });

    const directive = ngMocks.findInstance(HostDirective);
    expect(directive.input).toEqual('test');
    expect(ngMocks.formatHtml(fixture)).toContain(' name="test"');
  });
});
```
