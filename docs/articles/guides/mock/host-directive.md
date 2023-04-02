---
title: How to mock a host directive
description: Mocking an Angular host directive
sidebar_label: Host Directive
---

It can happen that a component hast a host directive which should be mocked in a test.

There are several ways how `ng-mocks` can mock host directives:

- [`MockBuilder`](../../api/MockBuilder.md#shallow-flag) and its [`shallow`](../../api/MockBuilder.md#shallow-flag) flag
- [`MockBuilder`](../../api/MockBuilder.md) constructor
- `TestBed`

## `shallow` flag

It's the easiest and recommended way which covers all host directives automatically, so there is no need to specify all of them.

To mock all host directives, simply provide [`shallow`](../../api/MockBuilder.md#shallow-flag) flag in [`MockBuilder.mock`](../../api/MockBuilder.md#mock):

```ts
beforeEach(() =>
  MockBuilder().mock(TargetComponent, { shallow: true }),
);
```

Now, all host directives and their dependencies will be mocks.

## `MockBuilder`

[`MockBuilder`](../../api/MockBuilder.md) is useful, when only one or some host directives should be mocked.

To do so, the host directives should be specified as the second parameter of [`MockBuilder`](../../api/MockBuilder.md):

```ts
beforeEach(() => MockBuilder(TargetComponent, HostDirective));
```

That's it, now `TargetComponent` will have a mock of `HostDirective`.

## TestBed

If you use `TestBed`, you should mock the desired host directive with [`MockDirective`](../../api/MockDirective.md)
and import / declare its component.

For example, if the name of the component is `TargetComponent` and its host directive is called `HostDirective`,
then `TestBed` can be defined like that:

```ts
beforeEach(() =>
  TestBed.configureTestingModule({
    imports: [MockDirective(HostDirective)], // mocking the host directive
    declarations: [TargetComponent], // declaring the component under test
  }).compileComponents(),
);
```

Profit! Under the hood `TargetComponent` will be redefined to use a mock of `HostDirective`.

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockHostDirective/test.spec.ts&initialpath=%3Fspec%3DMockHostDirective)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockHostDirective/test.spec.ts&initialpath=%3Fspec%3DMockHostDirective)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockHostDirective/test.spec.ts"
import {
  Component,
  Directive,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockDirective,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: 'host',
  standalone: true,
})
class HostDirective {
  @Input() input?: string;
  @Output() output = new EventEmitter<void>();

  public hostMockHostDirective() {}
}

@Component({
  selector: 'target',
  hostDirectives: [
    {
      directive: HostDirective,
      inputs: ['input'],
      outputs: ['output'],
    },
  ],
  template: 'target',
})
class TargetComponent {
  public targetMockHostDirective() {}
}

describe('MockHostDirective', () => {
  describe('TestBed', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [MockDirective(HostDirective)],
        declarations: [TargetComponent],
      }),
    );

    it('mocks host directives', () => {
      const fixture = TestBed.createComponent(TargetComponent);

      const directive = ngMocks.findInstance(fixture, HostDirective);
      expect(directive).toBeDefined();
    });
  });

  describe('MockBuilder', () => {
    beforeEach(() => MockBuilder(TargetComponent, HostDirective));

    it('mocks host directives', () => {
      MockRender(TargetComponent, { input: 'test' });

      const directive = ngMocks.findInstance(HostDirective);
      expect(directive.input).toEqual('test');
    });
  });

  describe('MockBuilder:shallow', () => {
    beforeEach(() =>
      MockBuilder().mock(TargetComponent, { shallow: true }),
    );

    it('mocks host directives', () => {
      MockRender(TargetComponent, { input: 'test' });

      const directive = ngMocks.findInstance(HostDirective);
      expect(directive.input).toEqual('test');
    });
  });
});
```
