---
title: How to mock a structural directive with let and of
description: Mocking an Angular structural directive with short syntax
sidebar_label: Structural directive (let, of)
---

Angular supports short syntax to declare a structural directive.

For example

```html
<div *dxTemplate="let cellTemplate of 'actionsCellTemplate'">
  {{ cellTemplate.data }}
</div>
```

means that the `cellTemplate` variable will point to the `$implicit` context of the directive,
and the string `'actionsCellTemplate'` will be assigned to the `dxTemplateOf` input of the directive.

## Static context

The simplest way is to provide a fake `$implicit` context of `DxTemplateDirective`.
That can be done with help of the [`render`](../../api/MockBuilder.md#render-flag) flag,
which is a part of [`MockBuilder`](../../api/MockBuilder.md).

```ts
beforeEach(() =>
  MockBuilder().mock(DxTemplateDirective, {
    render: {
      $implicit: {
        data: 'MOCK_DATA',
      },
    },
  }),
);
```

In this case, during rendering `cellTemplate.data` will point to `MOCK_DATA`, and we can assert that:

```ts
const html = ngMocks.formatHtml(fixture);
expect(html).toEqual('<div> MOCK_DATA </div>');
```

Additionally, we can assert that the value of `dxTemplateOf` of the directive is `'actionsCellTemplate'`.

```ts
const instance = ngMocks.findInstance(DxTemplateDirective);
expect(instance.dxTemplateOf).toEqual('actionsCellTemplate');
```

## Dynamic context

If static context isn't an option, then instead of rendering the structural directive with other elements,
it can be rendered later on in the middle of testing.

To do that we need to use [`ngMocks.render`](../../api/ngMocks/render.md#render-structural-directives) to render the directive,
and [`ngMocks.hide`](../../api/ngMocks/hide.md#structural-directive) to hide the directive.

```ts
// We need to find the instance of the directive.
const instance = ngMocks.findInstance(DxTemplateDirective);
// To render the instance, we need to pass it as the first and the seconds parameters.
// $implicit context is the third parameter.
ngMocks.render(instance, instance, {
  data: 'MOCK_DATA',
});
```

## Live example of static context

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestDirectiveLetOf/static.spec.ts&initialpath=%3Fspec%3DTestDirectiveLetOf%3Astatic)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestDirectiveLetOf/static.spec.ts&initialpath=%3Fspec%3DTestDirectiveLetOf%3Astatic)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestDirectiveLetOf/static.spec.ts"
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dxTemplate]',
})
class DxTemplateDirective {
  @Input() public readonly dxTemplateOf: string | null = null;

  public constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainerRef: ViewContainerRef,
  ) {}
}

describe('TestDirectiveLetOf:static', () => {
  beforeEach(() =>
    MockBuilder().mock(DxTemplateDirective, {
      // We should not only render the structural directive,
      // but also provide its context variables.
      render: {
        $implicit: {
          data: 'MOCK_DATA',
        },
      },
    }),
  );

  it('renders a mock of structural directives', () => {
    const fixture = MockRender(`
      <div *dxTemplate="let cellTemplate of 'actionsCellTemplate'">
        {{ cellTemplate.data }}
      </div>
    `);

    // firstly, let's check that we passed 'actionsCellTemplate' as input value.
    expect(
      ngMocks.findInstance(DxTemplateDirective).dxTemplateOf,
    ).toEqual('actionsCellTemplate');

    // secondly, let's check that MOCK_DATA has been rendered.
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<div> MOCK_DATA </div>',
    );
  });
});
```

## Live example of dynamic context

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestDirectiveLetOf/dynamic.spec.ts&initialpath=%3Fspec%3DTestDirectiveLetOf%3Adynamic)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestDirectiveLetOf/dynamic.spec.ts&initialpath=%3Fspec%3DTestDirectiveLetOf%3Adynamic)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestDirectiveLetOf/dynamic.spec.ts"
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dxTemplate]',
})
class DxTemplateDirective {
  @Input() public readonly dxTemplateOf: string | null = null;

  public constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainerRef: ViewContainerRef,
  ) {}
}

describe('TestDirectiveLetOf:dynamic', () => {
  beforeEach(() => MockBuilder().mock(DxTemplateDirective));

  it('renders a mock of structural directives', () => {
    const fixture = MockRender(`
      <div *dxTemplate="let cellTemplate of 'actionsCellTemplate'">
        {{ cellTemplate.data }}
      </div>
    `);

    // firstly, let's check that we passed 'actionsCellTemplate' as input value.
    const instance = ngMocks.findInstance(DxTemplateDirective);
    expect(instance.dxTemplateOf).toEqual('actionsCellTemplate');

    // secondly, let's render the structural directive,
    // and assert that MOCK_DATA is present.
    ngMocks.render(instance, instance, {
      data: 'MOCK_DATA',
    });
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<div> MOCK_DATA </div>',
    );
  });
});
```
