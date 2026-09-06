---
title: How to test ContentChildren in Angular
description: Test projected child collections, QueryList updates, and contentChildren signals with ng-mocks.
sidebar_label: ContentChildren
---

When we test a component or directive that uses `ContentChildren`,
we need to project the children that belong in its query results.
We can mock those children while keeping the declaration with the query real.

The first examples use the `@ContentChildren` decorator. For the `contentChildren()` signal API,
see [Signal content queries](#signal-content-queries).

To replace the declaration with a mock, see [How to mock ContentChildren](mock/content-children.md).
For a query that returns one child, see [How to test ContentChild](content-child.md).

Let's assume that `TargetComponent` queries projected directives in two ways:

```ts title="target.component.ts"
@Component({
  selector: 'target-content',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  @ContentChildren(ChildDirective)
  public directItems?: QueryList<ChildDirective>;

  @ContentChildren(ChildDirective, { descendants: true })
  public allItems?: QueryList<ChildDirective>;
}
```

Its caller supplies a direct child and a nested child:

```html title="host.component.html"
<target-content>
  <span contentItem="direct"></span>
  <div><span contentItem="nested"></span></div>
</target-content>
```

Pass `TargetComponent` and its module to [`MockBuilder`](/api/MockBuilder.md).
This keeps the component real and replaces the directives in `TargetModule` with mocks:

```ts
// Return the result so the test waits for TestBed configuration.
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

For standalone declarations, explicitly add projected dependencies when they are not already
part of the setup, for example `MockBuilder(TargetComponent).mock(ChildDirective)`.

After rendering the host with [`MockRender`](/api/MockRender.md), we can use
[`ngMocks.findInstance`](/api/ngMocks/findInstance.md) to find the component and
[`ngMocks.findInstances`](/api/ngMocks/findInstances.md) to find its projected mocks:

```ts
const target = ngMocks.findInstance(TargetComponent);
const items = ngMocks.findInstances(ChildDirective);

// The default query contains direct children only.
expect(target.directItems?.toArray()).toEqual([items[0]]);

// descendants: true also includes the nested directive.
expect(target.allItems?.toArray()).toEqual(items);
expect(items.map(item => item.contentItem)).toEqual(['direct', 'nested']);
```

The results are `QueryList` instances. Use `toArray()`, `first`, or `length` to inspect them.
The query still uses the original `ChildDirective` token, which ng-mocks makes available on each mock.
The `read` option can select another token on each matched element, such as `ElementRef` or `TemplateRef`.

:::note Query scope and updates

`ContentChildren` searches direct projected children by default.
Use `descendants: true` to include nested content from the caller's template.
Queries do not enter another component's private view.

The collection is ready in `ngAfterContentInit` and updates when projected content changes and
change detection runs. Subscribe to `QueryList.changes` to observe those updates;
the [query updates example](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/updates.spec.ts)
shows a collection changing as an embedded view is added and removed.
`ContentChildren` has no `static` option.

Rendering `MockRender(TargetComponent)` without projected content produces an empty `QueryList`,
even when the child directive is declared in TestBed.

:::

## Signal content queries

For `contentChildren` signals, we also keep the declaration with the queries real:

```ts title="target.component.ts"
@Component({
  selector: 'target-signal-content',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  public readonly direct = contentChildren(ItemDirective);
  public readonly all = contentChildren(ItemDirective, { descendants: true });
}
```

The [signal example below](#live-example-of-signal-content-queries) uses a standalone `HostComponent`
that imports the target and projects two `ItemDirective` instances into it.
Keep the target when mocking the host's dependencies:

```ts
beforeEach(() => MockBuilder(HostComponent).keep(TargetComponent));
```

Read the signals after rendering to check their arrays of results:

```ts
const fixture = MockRender(HostComponent);
const target = ngMocks.findInstance(TargetComponent);
const items = ngMocks.findInstances(ItemDirective);

expect(target.direct()).toEqual([items[0]]);
expect(target.all()).toEqual(items);

// Removing the direct child updates both collections.
fixture.point.componentInstance.show.set(false);
fixture.detectChanges();
expect(target.direct()).toEqual([]);
expect(target.all()).toEqual([items[1]]);
```

Signal queries are available from Angular 17.2 and stable from Angular 19.
`contentChildren` returns a readonly array, including an empty array when no children match.
It supports `read` and `descendants` and has no required-query variant.
The live example uses `read: ElementRef` to query elements and `computed` to derive labels from the queried directives.
It checks both removal and reinsertion, including collection order and the derived values.
For a mocked declaration's signal collection, see
[How to mock contentChildren signals](mock/content-children.md#signal-content-queries).

## Live example

This decorator example uses Angular 18 NgModules and focuses on the collection cases from `TestContentChild`.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestContentChild/test.spec.ts&initialpath=%3Fspec%3DTestContentChild)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestContentChild/test.spec.ts&initialpath=%3Fspec%3DTestContentChild)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/test.spec.ts"
import {
  Component,
  ContentChildren,
  Directive,
  Input,
  NgModule,
  QueryList,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[contentItem]',
  exportAs: 'contentItem',
})
class ChildDirective {
  @Input() public contentItem = '';
}

@Component({
  selector: 'target-content',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  @ContentChildren(ChildDirective)
  public directItems?: QueryList<ChildDirective>;

  @ContentChildren(ChildDirective, { descendants: true })
  public allItems?: QueryList<ChildDirective>;
}

@NgModule({
  declarations: [ChildDirective, TargetComponent],
  exports: [ChildDirective, TargetComponent],
})
class TargetModule {}

describe('TestContentChild', () => {
  it('queries projected mock directives', async () => {
    // Keep the query owner real and mock the projected directives.
    await MockBuilder(TargetComponent, TargetModule);
    MockRender(`
      <target-content>
        <span contentItem="direct"></span>
        <div><span contentItem="nested"></span></div>
      </target-content>
    `);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ChildDirective);

    // Compare the direct children with the full descendant collection.
    expect(target.directItems?.toArray()).toEqual([items[0]]);
    expect(target.allItems?.toArray()).toEqual(items);

    // The caller's input bindings are preserved on the mocks.
    expect(items.map(item => item.contentItem)).toEqual(['direct', 'nested']);
  });

  it('leaves a missing collection empty', async () => {
    // Declaring a directive does not create projected instances of it.
    await MockBuilder(TargetComponent, TargetModule);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.directItems?.length).toBe(0);
    expect(target.allItems?.length).toBe(0);
  });
});
```

## Live example of signal content queries

This example uses Angular 19+ standalone defaults and compiler-initialized signal queries.

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/signals.spec.ts"
import {
  Component,
  computed,
  contentChildren,
  Directive,
  ElementRef,
  Input,
  signal,
} from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

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
  public readonly elements = contentChildren(ItemDirective, {
    descendants: true,
    read: ElementRef,
  });
  public readonly labels = computed(() => this.all().map(item => item.signalContentItem));
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
  it('updates contentChildren signals, read tokens, and computed collections', async () => {
    // Keep the owner real and query its projected mock directives.
    await MockBuilder(HostComponent).keep(TargetComponent);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);
    const elements = ngMocks.findAll('span').map(element => element.nativeElement);

    // Compare direct children, descendants, and the elements read from them.
    expect(target.direct()).toEqual([items[0]]);
    expect(target.all()).toEqual(items);
    expect(target.labels()).toEqual(['first', 'nested']);
    expect(target.elements().map(element => element.nativeElement)).toEqual([
      elements[0],
      elements[1],
    ]);
    expect(isMockOf(items[0], ItemDirective)).toBe(true);
    expect(isMockOf(items[1], ItemDirective)).toBe(true);

    // Removing the direct child updates both collections and their computed consumer.
    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([items[1]]);
    expect(target.labels()).toEqual(['nested']);
    expect(target.elements().map(element => element.nativeElement)).toEqual([
      elements[1],
    ]);

    // Restoring it restores collection order while preserving the nested child.
    fixture.point.componentInstance.show.set(true);
    fixture.detectChanges();
    const restored = ngMocks.findInstances(ItemDirective);
    expect(restored[0]).not.toBe(items[0]);
    expect(restored[1]).toBe(items[1]);
    expect(target.direct()).toEqual([restored[0]]);
    expect(target.all()).toEqual(restored);
    expect(target.labels()).toEqual(['first', 'nested']);
    expect(target.elements().map(element => element.nativeElement)).toEqual([
      ngMocks.find('span').nativeElement,
      elements[1],
    ]);
  });

  it('returns empty contentChildren signals when content is missing', async () => {
    await MockBuilder(TargetComponent);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([]);
    expect(target.elements()).toEqual([]);
    expect(target.labels()).toEqual([]);
  });
});
```
