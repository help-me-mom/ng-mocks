---
title: How to mock ContentChildren in Angular
description: Mock a component with ContentChildren, render collected templates, and customize contentChildren signals.
sidebar_label: ContentChildren
---

When a component or directive with `ContentChildren` is a dependency of the declaration under test,
we can replace it with a mock and test the content that its caller projects into it.

The first examples use the `@ContentChildren` decorator. For the `contentChildren()` signal API,
see [Signal content queries](#signal-content-queries).

For tests of the declaration's own collection and updates, see
[How to test ContentChildren](../content-children.md).
For a query that returns one child, see [How to mock ContentChild](content-child.md).

Let's assume that `XdCardComponent` collects templates marked with `MyTplDirective`:

```ts title="xd-card.component.ts"
@Component({
  selector: 'xd-card-template-ref-by-render',
  template: '',
})
class XdCardComponent {
  @ContentChildren(MyTplDirective)
  public readonly templates?: QueryList<MyTplDirective>;
}
```

Its caller supplies a header and a footer. The `myTpl` input identifies each template:

```html title="host.component.html"
<xd-card-template-ref-by-render>
  <ng-template myTpl="header" let-label>
    rendered-header-{{ label }}
  </ng-template>

  <span my-tpl *myTpl="'footer'; let label">
    rendered-footer-{{ label }}
  </span>
</xd-card-template-ref-by-render>
```

Passing the module as the second argument to [`MockBuilder`](/api/MockBuilder.md)
replaces its declarations with mocks, including `XdCardComponent` and `MyTplDirective`:

```ts
// Return the result so the test waits for TestBed configuration.
beforeEach(() => MockBuilder(null, TargetModule));
```

[`MockComponent`](/api/MockComponent.md) and [`MockDirective`](/api/MockDirective.md)
preserve `ContentChildren` queries and their `read` and `descendants` options.
Angular populates a `QueryList` on the mock while the declaration's real lifecycle logic is mocked.
The query contains direct children by default; `descendants: true` includes nested projected content.
Without matching children, the collection is empty. `ContentChildren` has no `static` option.

## Render collected templates

After rendering the host with [`MockRender`](/api/MockRender.md), we can find the card with
[`ngMocks.find`](/api/ngMocks/find.md) and select a template by its input value with
[`ngMocks.findTemplateRef`](/api/ngMocks/findTemplateRef.md):

```ts
const xdCardEl = ngMocks.find('xd-card-template-ref-by-render');
const tplHeader = ngMocks.findTemplateRef(xdCardEl, ['myTpl', 'header']);
const tplFooter = ngMocks.findTemplateRef(xdCardEl, ['myTpl', 'footer']);
```

Use [`ngMocks.render`](/api/ngMocks/render.md) to render each template with a value for `$implicit`.
We can then check the caller's rendered content:

```ts
ngMocks.render(xdCardEl.componentInstance, tplHeader, 'test');
expect(xdCardEl.nativeElement.innerHTML).toContain('rendered-header-test');

ngMocks.render(xdCardEl.componentInstance, tplFooter, 'test');
expect(ngMocks.formatHtml(xdCardEl)).toContain(
  '<span my-tpl=""> rendered-footer-test </span>',
);
```

The footer's `*myTpl` syntax creates a template around the `span`.
Select that template with `['myTpl', 'footer']`; `my-tpl` is an attribute of the nested span.
To remove rendered content, pass the same component and template to [`ngMocks.hide`](/api/ngMocks/hide.md).

## Signal content queries

For a dependency that uses `contentChildren`, provide a signal with
[`MockInstance`](/api/MockInstance.md) and control the collection in the test:

```ts title="target.component.ts"
class TargetComponent {
  public readonly all = contentChildren(ItemDirective, { descendants: true });
}
```

The [signal example below](#live-example-of-signal-content-queries) uses a standalone `HostComponent`
that imports `TargetComponent` and projects two `ItemDirective` instances into it.
Pass the host to `MockBuilder` to mock both imported declarations:

```ts
beforeEach(() => MockBuilder(HostComponent));
```

Before rendering, supply the collection signal:

```ts
// In the suite, reset customizations after each test.
MockInstance.scope();

// In the test, provide an ordinary Angular signal before MockRender.
const all = signal<readonly ItemDirective[]>([]);
MockInstance(TargetComponent, 'all', all);
```

We can now set the collection to the projected mocks:

```ts
MockRender(HostComponent);
const target = ngMocks.findInstance(TargetComponent);
const items = ngMocks.findInstances(ItemDirective);

expect(target.all()).toEqual([]);
all.set(items);
expect(target.all()).toEqual(items);
```

:::note

Signal queries are available from Angular 17.2 and stable from Angular 19.
ng-mocks does not recreate their initializers on a mocked declaration.
The array supplied through `MockInstance` contains values set by the test;
Angular does not populate this ordinary signal as a content query, including after projected content changes.
Customize each signal property that the consumer reads.
To test Angular's collection updates, [keep the declaration real](../content-children.md#signal-content-queries).

:::

## Live example

This decorator example uses Angular 18 NgModules and keeps the collection and its header/footer rendering case from `TestTemplateRefByRender`.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestTemplateRefByRender/test.spec.ts&initialpath=%3Fspec%3DTestTemplateRefByRender)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestTemplateRefByRender/test.spec.ts&initialpath=%3Fspec%3DTestTemplateRefByRender)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestTemplateRefByRender/test.spec.ts"
import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Directive,
  Input,
  NgModule,
  QueryList,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[myTpl]',
})
class MyTplDirective {
  @Input('myTpl') public readonly name: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Component({
  selector: 'xd-card-template-ref-by-render',
  template: '',
})
class XdCardComponent {
  @ContentChildren(MyTplDirective)
  public readonly templates?: QueryList<MyTplDirective>;
}

@NgModule({
  declarations: [MyTplDirective, XdCardComponent],
  imports: [CommonModule],
})
class TargetModule {}

describe('TestTemplateRefByRender', () => {
  // Mock both the card and the template directive.
  beforeEach(() => MockBuilder(null, TargetModule));

  beforeEach(() =>
    MockRender(`
      <xd-card-template-ref-by-render>
        <ng-template myTpl="header" let-label>
          rendered-header-{{ label }}
        </ng-template>

        <span my-tpl *myTpl="'footer'; let label">
          rendered-footer-{{ label }}
        </span>
      </xd-card-template-ref-by-render>
    `),
  );

  it('renders templates', () => {
    const xdCardEl = ngMocks.find('xd-card-template-ref-by-render');
    const tplHeader = ngMocks.findTemplateRef(xdCardEl, ['myTpl', 'header']);
    const tplFooter = ngMocks.findTemplateRef(xdCardEl, ['myTpl', 'footer']);

    // Render the collected header with its implicit context.
    ngMocks.render(xdCardEl.componentInstance, tplHeader, 'test');
    expect(xdCardEl.nativeElement.innerHTML).toContain('rendered-header-test');

    // Render the footer created by the structural directive's short syntax.
    ngMocks.render(xdCardEl.componentInstance, tplFooter, 'test');
    expect(ngMocks.formatHtml(xdCardEl)).toContain(
      '<span my-tpl=""> rendered-footer-test </span>',
    );
  });
});
```

## Live example of signal content queries

This example uses Angular 19+ standalone defaults.

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/signals.spec.ts"
import {
  Component,
  contentChildren,
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
  public readonly direct = contentChildren(ItemDirective);
  public readonly all = contentChildren(ItemDirective, {
    descendants: true,
  });
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

  it('customizes contentChildren signals on a mocked owner', async () => {
    // Keep the host real and mock its imported declarations.
    await MockBuilder(HostComponent);

    // Provide each collection signal before creating the mock component.
    const direct = signal<readonly ItemDirective[]>([]);
    const all = signal<readonly ItemDirective[]>([]);
    MockInstance(TargetComponent, 'direct', direct);
    MockInstance(TargetComponent, 'all', all);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    // Projection does not populate the supplied signals.
    expect(isMockOf(target, TargetComponent)).toBe(true);
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([]);

    // Set the direct and descendant collections independently.
    direct.set([items[0]]);
    all.set(items);
    expect(target.direct()).toEqual([items[0]]);
    expect(target.all()).toEqual(items);

    // Projection changes do not populate or clear these ordinary signals.
    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.direct()).toEqual([items[0]]);
    expect(target.all()).toEqual(items);

    // Apply the changed collection values explicitly.
    direct.set([]);
    all.set([items[1]]);
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([items[1]]);
  });
});
```
