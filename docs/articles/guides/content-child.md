---
title: How to test ContentChild in Angular
description: Test a projected child, query timing, and contentChild signals with ng-mocks.
sidebar_label: ContentChild
---

When we test a component or directive that uses `ContentChild`,
we need to provide the child that its caller projects into it.
We can replace that child with a mock and test how the real declaration uses it.

The first examples use the `@ContentChild` decorator. For the `contentChild()` signal API,
see [Signal content queries](#signal-content-queries).

To replace a component or directive that owns content queries with a mock, see
[How to mock ContentChild](mock/content-child.md).
For collections of projected children, see [How to test ContentChildren](content-children.md).

Let's assume that `TargetComponent` queries a child component.
It also subscribes to the child's `value$` observable during content initialization:

```ts title="target.component.ts"
@Component({
  selector: 'target-content',
  template: '<ng-content></ng-content>',
})
class TargetComponent implements AfterContentInit {
  @ContentChild(ChildComponent)
  public child?: ChildComponent;

  public value = '';

  public ngAfterContentInit(): void {
    if (this.child) {
      this.child.value$.subscribe(value => {
        this.value = value;
      });
    }
  }
}
```

Its caller supplies a child component and two directives:

```html title="host.component.html"
<target-content>
  <child-content [label]="label" (selected)="selected = $event"></child-content>
  <span contentItem="direct" #item="contentItem"></span>
  <div><span contentItem="nested"></span></div>
  <ng-template #tpl let-value>{{ value }}</ng-template>
</target-content>
```

We can pass `TargetComponent` and its module to [`MockBuilder`](/api/MockBuilder.md).
This keeps `TargetComponent` real and replaces the other declarations in `TargetModule` with mocks:

```ts
// Return the result so the test waits for TestBed configuration.
beforeEach(() => MockBuilder(TargetComponent, TargetModule));
```

For a standalone declaration, explicitly mock the projected dependencies when they are not already
part of the setup, for example `MockBuilder(TargetComponent).mock(ChildComponent)`.

## Customize a child before content initialization

Because `TargetComponent` subscribes to `value$` in `ngAfterContentInit`,
we need to provide that observable before [`MockRender`](/api/MockRender.md) runs change detection.
[`MockInstance`](/api/MockInstance.md) lets us customize the child before Angular creates it:

```ts
// Reset customizations after each test.
MockInstance.scope();

// In the test, before MockRender:
MockInstance(ChildComponent, 'value$', of('mock value'));
```

Here, `of` is imported from `rxjs` and emits the supplied value synchronously.

After rendering the host template, we can use [`ngMocks.findInstance`](/api/ngMocks/findInstance.md)
to access the component and its child. The query finds the mock under the original `ChildComponent` token:

```ts
const target = ngMocks.findInstance(TargetComponent);
const child = ngMocks.findInstance(ChildComponent);

// The real lifecycle hook has consumed the mock's value.
expect(target.child).toBe(child);
expect(target.value).toBe('mock value');

// Inputs and outputs work on the projected mock.
expect(child.label).toBe('projected');
child.selected.emit('chosen');
expect(fixture.componentInstance.selected).toBe('chosen');
```

:::note

An unstubbed `value$` can be `undefined`. Flushing timers does not create an observable;
provide one with `MockInstance` as described in [mocking observables](../extra/mock-observables.md).
To inspect the component before initialization, pass `{ detectChanges: false }` as the third argument
to `MockRender`, then call `fixture.detectChanges()` when ready.

:::

The [live example](#live-example) also checks `read` with `ChildDirective` and `ElementRef`,
and a projected `TemplateRef`. A string query such as `'item'` refers to a template variable or provider token.
Content queries search projected content; they do not enter another component's private view.

:::note Query timing and descendants

`ContentChild` includes descendants by default; Angular 14+ accepts `descendants: false` for direct children only.

Dynamic queries update when projected content changes and change detection runs,
as shown in the [query updates example](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/updates.spec.ts).
From Angular 8, `ContentChild` with `{ static: true }` resolves before `ngOnInit` and keeps its initial result.
The [timing example](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/static.spec.ts)
demonstrates both timings.

Rendering `MockRender(TargetComponent)` without projected content leaves the query `undefined`,
even when the child declaration is present in TestBed.

:::

## Signal content queries

For `contentChild` signals, we also keep the declaration with the queries real.
For example, a standalone `TargetComponent` can query the directives projected by its `HostComponent`:

```ts
@Component({
  selector: 'target-signal-content',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  public readonly first = contentChild(ItemDirective);
  public readonly required = contentChild.required(ItemDirective);
}
```

The [signal example below](#live-example-of-signal-content-queries) includes the host and its projected directives.
Pass `HostComponent` to `MockBuilder` and keep `TargetComponent`, so only `ItemDirective` is mocked:

```ts
beforeEach(() => MockBuilder(HostComponent).keep(TargetComponent));
```

After rendering, read the signals to assert their results:

```ts
const fixture = MockRender(HostComponent);
const target = ngMocks.findInstance(TargetComponent);
const items = ngMocks.findInstances(ItemDirective);

expect(target.first()).toBe(items[0]);
expect(target.required()).toBe(items[0]);

// Removing the first projected child updates the query results.
fixture.point.componentInstance.show.set(false);
fixture.detectChanges();
expect(target.first()).toBe(items[1]);
expect(target.required()).toBe(items[1]);
```

Signal queries are available from Angular 17.2 and stable from Angular 19.
An optional query returns a child or `undefined`.
A required query throws when read without a matching child.
`contentChild` searches descendants by default; use `descendants: false` to restrict it to direct children.
Use `read` to retrieve another token, such as `ElementRef`, and `computed` to derive a value from the query signal.
The live example checks removal and reinsertion, including the derived value and the direct-child boundary.
For a mocked declaration's signal properties, see
[How to mock signal content queries](mock/content-child.md#signal-content-queries).

## Live example

This decorator example uses Angular 18 NgModules and keeps the singular-query cases from the source example.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestContentChild/test.spec.ts&initialpath=%3Fspec%3DTestContentChild)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestContentChild/test.spec.ts&initialpath=%3Fspec%3DTestContentChild)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/test.spec.ts"
import {
  AfterContentInit,
  Component,
  ContentChild,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  TemplateRef,
} from '@angular/core';
import { of } from 'rxjs';

import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'child-content',
  template: 'real child',
})
class ChildComponent {
  @Input() public label = '';
  @Output() public readonly selected = new EventEmitter<string>();
  public readonly value$ = of('real value');
}

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
class TargetComponent implements AfterContentInit {
  @ContentChild(ChildComponent)
  public child?: ChildComponent;

  @ContentChild('item', { read: ChildDirective })
  public directive?: ChildDirective;

  @ContentChild('item', { read: ElementRef })
  public element?: ElementRef;

  @ContentChild('tpl')
  public tpl?: TemplateRef<any>;

  public value = '';

  public ngAfterContentInit(): void {
    if (this.child) {
      this.child.value$.subscribe(value => {
        this.value = value;
      });
    }
  }
}

@NgModule({
  declarations: [
    ChildComponent,
    ChildDirective,
    TargetComponent,
  ],
  exports: [
    ChildComponent,
    ChildDirective,
    TargetComponent,
  ],
})
class TargetModule {}

describe('TestContentChild', () => {
  // Reset child customizations after each test.
  MockInstance.scope();

  it('queries projected mocks and customizes them before content initialization', async () => {
    // Keep the query owner real and customize its mock child before rendering.
    await MockBuilder(TargetComponent, TargetModule);
    MockInstance(ChildComponent, 'value$', of('mock value'));

    // Project components, directives, and a template through the host.
    const fixture = MockRender(
      `<target-content>
        <child-content [label]="label" (selected)="selected = $event"></child-content>
        <span contentItem="direct" #item="contentItem"></span>
        <div><span contentItem="nested"></span></div>
        <ng-template #tpl let-value>{{ value }}</ng-template>
      </target-content>`,
      { label: 'projected', selected: '' },
    );
    const target = ngMocks.findInstance(TargetComponent);
    const child = ngMocks.findInstance(ChildComponent);
    const items = ngMocks.findInstances(ChildDirective);

    // Assert the query result, input binding, and initialization behavior.
    expect(target.child).toBe(child);
    expect(isMockOf(child, ChildComponent)).toBe(true);
    expect(child.label).toBe('projected');
    expect(target.value).toBe('mock value');
    // Check read tokens and the projected template reference.
    expect(target.directive).toBe(items[0]);
    expect(target.element?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(target.tpl?.elementRef.nativeElement).toBe(
      ngMocks.findTemplateRef('tpl').elementRef.nativeElement,
    );
    // Emit through the mock child and check the host's output binding.
    child.selected.emit('chosen');
    expect(fixture.componentInstance.selected).toBe('chosen');
    expect(ngMocks.formatText(fixture)).not.toContain('real child');
  });

  it('leaves a missing child undefined', async () => {
    // Declaring dependencies does not create projected child instances.
    await MockBuilder(TargetComponent, TargetModule);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.child).toBeUndefined();
    expect(target.directive).toBeUndefined();
    expect(target.tpl).toBeUndefined();
    expect(target.value).toBe('');
  });
});
```

## Live example of signal content queries

This example uses Angular 19+ standalone defaults and compiler-initialized signal queries.

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/signals.spec.ts"
import {
  Component,
  computed,
  contentChild,
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
  public readonly first = contentChild(ItemDirective);
  public readonly required = contentChild.required(ItemDirective);
  public readonly directChild = contentChild(ItemDirective, {
    descendants: false,
  });
  public readonly element = contentChild(ItemDirective, {
    read: ElementRef,
  });
  public readonly firstLabel = computed(() => this.first()?.signalContentItem);
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
  it('updates contentChild signals and computed values when projected content changes', async () => {
    // Keep the host and query owner real; mock the projected directive.
    await MockBuilder(HostComponent).keep(TargetComponent);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    // Read the first child, required child, and element.
    expect(target.first()).toBe(items[0]);
    expect(target.required()).toBe(items[0]);
    expect(target.directChild()).toBe(items[0]);
    expect(target.firstLabel()).toBe('first');
    expect(target.element()?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(items.map(item => item.signalContentItem)).toEqual([
      'first',
      'nested',
    ]);
    expect(isMockOf(items[0], ItemDirective)).toBe(true);

    // Remove the direct child and check the updated query results.
    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.first()).toBe(items[1]);
    expect(target.required()).toBe(items[1]);
    expect(target.directChild()).toBeUndefined();
    expect(target.firstLabel()).toBe('nested');
    expect(target.element()?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );

    // Restoring the direct child creates a new instance and updates every query.
    fixture.point.componentInstance.show.set(true);
    fixture.detectChanges();
    const restored = ngMocks.findInstances(ItemDirective);
    expect(restored[0]).not.toBe(items[0]);
    expect(restored[1]).toBe(items[1]);
    expect(target.first()).toBe(restored[0]);
    expect(target.required()).toBe(restored[0]);
    expect(target.directChild()).toBe(restored[0]);
    expect(target.firstLabel()).toBe('first');
    expect(target.element()?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
  });

  it('returns no optional results and enforces a required query when content is missing', async () => {
    // Render the real owner without projecting any children.
    await MockBuilder(TargetComponent);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.first()).toBeUndefined();
    expect(target.directChild()).toBeUndefined();
    expect(target.element()).toBeUndefined();
    expect(target.firstLabel()).toBeUndefined();

    // Reading the required query reports the missing child.
    expect(() => target.required()).toThrowError(/NG0951/);
  });
});
```
