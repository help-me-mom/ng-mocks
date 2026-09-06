---
title: How to mock ContentChild in Angular
description: Mock a component with ContentChild, render its projected template, and customize contentChild signals.
sidebar_label: ContentChild
---

When a component or directive with `ContentChild` is a dependency of the declaration under test,
we can replace it with a mock and test its caller's bindings and projected content.

The first examples use the `@ContentChild` decorator. For the `contentChild()` signal API,
see [Signal content queries](#signal-content-queries).

For tests of the declaration's own query results and lifecycle, see
[How to test ContentChild](../content-child.md).
For collections of projected children, see [How to mock ContentChildren](content-children.md).

Let's assume that `TargetComponent` receives a template from its caller through `ContentChild`:

```ts title="target.component.ts"
@Component({
  selector: 'target-content',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  @ContentChild('tpl')
  public tpl?: TemplateRef<any>;
}
```

Its caller provides a template that displays a value supplied by the component:

```html title="host.component.html"
<target-content>
  <ng-template #tpl let-value>value: {{ value }}</ng-template>
</target-content>
```

We can replace `TargetComponent` with a mock using [`MockBuilder`](/api/MockBuilder.md):

```ts
// Return the result so the test waits for TestBed configuration.
beforeEach(() => MockBuilder().mock(TargetComponent));
```

[`MockComponent`](/api/MockComponent.md) and [`MockDirective`](/api/MockDirective.md)
preserve `ContentChild` queries and their `read`, `descendants`, and `static` options.
Angular populates the query on the mock, so `tpl` still points to the caller's template.
The declaration's real lifecycle logic is mocked.

## Render projected templates

After rendering the host with [`MockRender`](/api/MockRender.md), we can find the component
with [`ngMocks.findInstance`](/api/ngMocks/findInstance.md) and its template
with [`ngMocks.findTemplateRef`](/api/ngMocks/findTemplateRef.md):

```ts
const target = ngMocks.findInstance(TargetComponent);
const template = ngMocks.findTemplateRef('tpl');

// The mock's content query points to the projected template.
expect(target.tpl?.elementRef.nativeElement).toBe(
  template.elementRef.nativeElement,
);
```

The template stays unrendered until we request it.
Pass the mock, template, and a value for `$implicit` to [`ngMocks.render`](/api/ngMocks/render.md).
Then we can check the rendered text with [`ngMocks.formatText`](/api/ngMocks/formatText.md):

```ts
ngMocks.render(target, template, 'rendered');
expect(ngMocks.formatText(fixture)).toBe('value: rendered');
```

To remove the rendered content, call [`ngMocks.hide`](/api/ngMocks/hide.md):

```ts
ngMocks.hide(target, template);
expect(ngMocks.formatText(fixture)).toBe('');
```

For named template variables, pass their values as the fourth argument of `ngMocks.render`.
The [MockBuilder render option](/api/MockBuilder.md#render-flag) can also render a template by default.

## Signal content queries

For a dependency that uses `contentChild`, we can provide signals
with [`MockInstance`](/api/MockInstance.md) and control their values in the test.
For example, `TargetComponent` can expose these query properties:

```ts title="target.component.ts"
class TargetComponent {
  public readonly first = contentChild(ItemDirective);
  public readonly required = contentChild.required(ItemDirective);
}
```

The [signal example below](#live-example-of-signal-content-queries) has a standalone `HostComponent`
that imports `TargetComponent` and projects two `ItemDirective` instances into it.
Passing the host to `MockBuilder` mocks both imported declarations:

```ts
beforeEach(() => MockBuilder(HostComponent));
```

Before rendering, supply the signal properties that the test uses.
Give a required query an initial value too:

```ts
// In the suite, reset customizations after each test.
MockInstance.scope();

// In the test, provide ordinary Angular signals before MockRender.
const first = signal<ItemDirective | undefined>(undefined);
const fallback = new ItemDirective();
const required = signal(fallback);
MockInstance(TargetComponent, 'first', first);
MockInstance(TargetComponent, 'required', required);
```

We can now set both signals to a projected mock and assert the values exposed by `TargetComponent`:

```ts
MockRender(HostComponent);
const target = ngMocks.findInstance(TargetComponent);
const items = ngMocks.findInstances(ItemDirective);

first.set(items[0]);
required.set(items[0]);
expect(target.first()).toBe(items[0]);
expect(target.required()).toBe(items[0]);
```

:::note

Signal queries are available from Angular 17.2 and stable from Angular 19.
ng-mocks does not recreate their initializers on a mocked declaration.
The signals supplied through `MockInstance` contain values set by the test;
Angular does not populate them as content queries, including after projected content changes.
Customize every property that the consumer reads, including a required query if it uses one.
To test Angular's query resolution and updates, [keep the declaration real](../content-child.md#signal-content-queries).

:::

## Live example

This Angular 18 decorator example shows the template query and rendering case from `TestContentChild`.
The source file also contains the child queries covered in the [testing guide](../content-child.md).

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestContentChild/test.spec.ts&initialpath=%3Fspec%3DTestContentChild)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestContentChild/test.spec.ts&initialpath=%3Fspec%3DTestContentChild)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/test.spec.ts"
import { Component, ContentChild, TemplateRef } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-content',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  @ContentChild('tpl')
  public tpl?: TemplateRef<any>;
}

describe('TestContentChild', () => {
  it('renders a projected template when its query owner is mocked', async () => {
    // Mock the component that receives the caller's template.
    await MockBuilder().mock(TargetComponent);
    const fixture = MockRender(
      '<target-content><ng-template #tpl let-value>value: {{ value }}</ng-template></target-content>',
    );
    const target = ngMocks.findInstance(TargetComponent);
    const template = ngMocks.findTemplateRef('tpl');

    // The query finds the template, which is initially unrendered.
    expect(target.tpl?.elementRef.nativeElement).toBe(
      template.elementRef.nativeElement,
    );
    expect(ngMocks.formatText(fixture)).toBe('');

    // Supply the implicit value and check the caller's rendered content.
    ngMocks.render(target, template, 'rendered');
    expect(ngMocks.formatText(fixture)).toBe('value: rendered');

    // Hide the template and check that its content has been removed.
    ngMocks.hide(target, template);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
```

## Live example of signal content queries

This example uses Angular 19+ standalone defaults.

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/signals.spec.ts"
import {
  Component,
  contentChild,
  Directive,
  Input,
  signal,
} from '@angular/core';

import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: '[signalContentItem]',
})
class ItemDirective {
  @Input() public signalContentItem = '';
}

@Component({
  selector: 'target-signal-content',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  public readonly first = contentChild(ItemDirective);
  public readonly required = contentChild.required(ItemDirective);
}

@Component({
  selector: 'host-signal-content',
  imports: [ItemDirective, TargetComponent],
  template: `
    <target-signal-content>
      @if (show()) {
        <span signalContentItem="first"></span>
      }
      <div><span signalContentItem="nested"></span></div>
    </target-signal-content>
  `,
})
class HostComponent {
  public readonly show = signal(true);
}

describe('TestContentChild:signals', () => {
  MockInstance.scope();

  it('customizes optional and required contentChild signals on a mocked owner', async () => {
    // Keep the host real and mock its imported declarations.
    await MockBuilder(HostComponent);

    // Provide the signal properties before creating the mock component.
    const first = signal<ItemDirective | undefined>(undefined);
    const fallback = new ItemDirective();
    const required = signal(fallback);
    MockInstance(TargetComponent, 'first', first);
    MockInstance(TargetComponent, 'required', required);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    // The supplied signals retain their initial values after projection.
    expect(isMockOf(target, TargetComponent)).toBe(true);
    expect(target.first()).toBeUndefined();
    expect(target.required()).toBe(fallback);

    // Set the values explicitly and read them through the mock.
    first.set(items[0]);
    required.set(items[0]);
    expect(target.first()).toBe(items[0]);
    expect(target.required()).toBe(items[0]);

    // Changing projected content does not update ordinary signals on the mock.
    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.first()).toBe(items[0]);
    expect(target.required()).toBe(items[0]);

    // The test controls missing optional values and replacement required values.
    first.set(undefined);
    required.set(items[1]);
    expect(target.first()).toBeUndefined();
    expect(target.required()).toBe(items[1]);
  });
});
```
