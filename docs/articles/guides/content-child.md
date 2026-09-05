---
title: How to test ContentChild / ContentChildren and signal content queries
description: Test projected components, directives, templates, query timing, and signal content queries with ng-mocks.
sidebar_label: ContentChild / ContentChildren
---

Content queries find children **projected into a component or directive** by its caller.
To test code that uses `@ContentChild` or `@ContentChildren`, keep the query owner real,
mock its child dependencies, and supply projected content in a host template.
This also lets Angular run content initialization normally.

```ts
MockInstance.scope();
beforeEach(() => MockBuilder(TargetComponent, TargetModule));

it('queries a projected child', () => {
  MockInstance(ChildComponent, 'value$', new Observable<string>(subscriber => {
    subscriber.next('mock value');
    subscriber.complete();
  }));
  MockRender(`
    <target-content>
      <child-content></child-content>
    </target-content>
  `);

  const target = ngMocks.findInstance(TargetComponent);
  expect(target.child).toBe(ngMocks.findInstance(ChildComponent));
});
```

`TargetModule` must declare or import the dependencies used in the host template.
With standalone declarations, keep the query owner and explicitly add projected dependencies,
for example `MockBuilder(TargetComponent).mock(ChildComponent)`.
A standalone component's imports describe its own view; they do not necessarily contain its projected children.

`MockRender(TargetComponent)` creates an empty host for the component. It does not invent projected children.
A missing `@ContentChild` is `undefined`; a missing `@ContentChildren` is an empty `QueryList`.
Adding a mock child to TestBed's declarations or providers alone does not project an instance.
Use the original class, such as `@ContentChild(ChildComponent)`, in the query: ng-mocks makes the mock
available under that class token.

Unlike [view queries](view-child.md), content queries do not search the component's own template
or enter another component's private view. A string locator such as `'item'` matches a template reference
variable or a provider token, rather than a CSS selector.

## Customize a child before content initialization

Dynamic decorator queries are ready in `ngAfterContentInit`, after the first change detection.
[`MockRender`](../api/MockRender.md) runs that change detection by default.
If the query owner subscribes to a child's observable or calls its method in that hook,
customize the **mock child** with [`MockInstance`](../api/MockInstance.md) before rendering:

```ts
MockInstance.scope();
beforeEach(() => MockBuilder(TargetComponent, TargetModule));

it('uses the mocked observable in ngAfterContentInit', () => {
  MockInstance(ChildComponent, 'value$', new Observable<string>(subscriber => {
    subscriber.next('mock value');
    subscriber.complete();
  }));

  MockRender(`
    <target-content>
      <child-content></child-content>
    </target-content>
  `);

  expect(ngMocks.findInstance(TargetComponent).value).toBe('mock value');
});
```

A mock's ordinary properties and method return values need explicit behavior when the test uses them.
For example, an unstubbed `value$` can be `undefined`; flushing timers will not create an observable.
See [mocking observables](../extra/mock-observables.md).

To inspect the state before initialization, render with
`MockRender(template, params, { detectChanges: false })`, then call `fixture.detectChanges()`.
Use `fakeAsync` / `flush` only for asynchronous work that actually uses timers, and only in a zoned test.
They do not supply projected content or replace change detection.

## Query options and changes

- `@ContentChild` finds the first match, including descendants by default.
  Angular 14+ also accepts `descendants: false` to restrict it to direct children.
- `@ContentChildren` finds direct children by default. Use `descendants: true` to include nested content
  from the same host template. Its result is a `QueryList`: use `toArray()`, `first`, or `length`,
  and subscribe to `changes` when the collection changes.
- `read` selects a different token on the matched element, for example
  `@ContentChild('item', { read: ChildDirective })` or `{ read: ElementRef }`.
  A projected `<ng-template #tpl>` can be queried as `@ContentChild('tpl')` and returns a `TemplateRef`.
- From Angular 8, `@ContentChild(..., { static: true })` resolves before `ngOnInit` and does not update later.
  Dynamic queries update after content is added or removed and change detection runs.
  `@ContentChildren` does not have a `static` option.

View Engine treats plain elements without directives as transparent when measuring query depth.
The live example uses a grouping directive so the descendant boundary is consistent with Ivy.

The [timing example](https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/static.spec.ts)
checks the lifecycle hooks, adds and removes an embedded view, and verifies that the dynamic query and
`QueryList.changes` update while the static query keeps its initial result.

## Mock the query owner

When testing a parent that uses `TargetComponent`, mock `TargetComponent` instead.
Decorator content queries are retained on mock components and directives, including their `read`,
`descendants`, and `static` options. Their real lifecycle logic is mocked.

Projected `ng-template` content stays unrendered until requested. To render it in a mock component:

```ts
const target = ngMocks.findInstance(TargetComponent);
const template = ngMocks.findTemplateRef('tpl');

ngMocks.render(target, template, 'rendered');
// <ng-template #tpl let-value>{{ value }}</ng-template>
// now displays "rendered".

ngMocks.hide(target, template);
```

The third argument supplies `$implicit`; a fourth object supplies named template variables.
See [`ngMocks.render`](../api/ngMocks/render.md), [`ngMocks.hide`](../api/ngMocks/hide.md),
and the [MockBuilder render option](../api/MockBuilder.md#render-flag) for default template rendering.
To verify the real owner's template rendering or lifecycle behavior, keep that owner real.

## Signal content queries

Angular 17.2 introduced `contentChild` and `contentChildren`; they are stable from Angular 19.
The same host-template approach works when the query owner is real:

```ts
@Component({
  selector: 'target-signal-content',
  standalone: true,
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  readonly first = contentChild(ChildDirective);
  readonly required = contentChild.required(ChildDirective);
  readonly items = contentChildren(ChildDirective, { descendants: true });
}
```

Read `target.first()` and `target.items()` after rendering. The first result is a child or `undefined`;
the collection is a readonly array, rather than a `QueryList`.
A required query throws when read without a matching child, so project that child in tests that read it.
Signal queries also support `read` and content descendant options, and update when projected content changes.

When the **query owner itself is mocked**, ng-mocks does not recreate its signal query initializers.
Keep it real to test Angular query resolution. To test code that consumes the mocked owner's signal properties,
supply ordinary signals through `MockInstance` before rendering:

```ts
MockInstance.scope();
beforeEach(() => MockBuilder(HostComponent));

it('customizes a mocked query owner', () => {
  const first = signal<ChildDirective | undefined>(undefined);
  const items = signal<readonly ChildDirective[]>([]);
  MockInstance(TargetComponent, 'first', first);
  MockInstance(TargetComponent, 'items', items);

  MockRender(HostComponent);
  const child = ngMocks.findInstance(ChildDirective);
  first.set(child);
  items.set([child]);
});
```

These custom signals have the values supplied by the test; Angular does not populate them as content queries.
The [compiled signal example](https://github.com/help-me-mom/ng-mocks/blob/main/tests-e2e/src/app/content-queries.spec.ts)
checks projection, `read`, descendants, required queries, updates, and mock customization.
See Angular's [content-query reference](https://angular.dev/guide/components/queries) for the framework API.

## Live example

The following example tests a real query owner with mocked children, including inputs, outputs,
customized initialization, and template rendering in a mocked owner.
As in the other NgModule guides, the snippet omits compatibility metadata;
with Angular 19+, add `standalone: false` to declarations placed in an NgModule.
Angular 8 also requires an explicit `{ static: false }` option on dynamic `@ContentChild` queries.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/TestContentChild/test.spec.ts&initialpath=%3Fspec%3DTestContentChild)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestContentChild/test.spec.ts&initialpath=%3Fspec%3DTestContentChild)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/TestContentChild/test.spec.ts"
import {
  AfterContentInit,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  EventEmitter,
  Input,
  NgModule,
  Output,
  QueryList,
  TemplateRef,
} from '@angular/core';
import { Observable } from 'rxjs';

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
  public readonly value$ = new Observable<string>(subscriber => {
    subscriber.next('real value');
    subscriber.complete();
  });
}

@Directive({
  selector: '[contentItem]',
  exportAs: 'contentItem',
})
class ChildDirective {
  @Input() public contentItem = '';
}

@Directive({
  selector: '[contentGroup]',
})
class GroupDirective {}

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

  @ContentChildren(ChildDirective)
  public directItems?: QueryList<ChildDirective>;

  @ContentChildren(ChildDirective, { descendants: true })
  public allItems?: QueryList<ChildDirective>;

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
    GroupDirective,
    TargetComponent,
  ],
  exports: [
    ChildComponent,
    ChildDirective,
    GroupDirective,
    TargetComponent,
  ],
})
class TargetModule {}

describe('TestContentChild', () => {
  MockInstance.scope();

  it('queries projected mocks and customizes them before content initialization', async () => {
    await MockBuilder(TargetComponent, TargetModule);
    MockInstance(
      ChildComponent,
      'value$',
      new Observable<string>(subscriber => {
        subscriber.next('mock value');
        subscriber.complete();
      }),
    );

    const fixture = MockRender(
      `<target-content>
        <child-content [label]="label" (selected)="selected = $event"></child-content>
        <span contentItem="direct" #item="contentItem"></span>
        <div contentGroup><span contentItem="nested"></span></div>
        <ng-template #tpl let-value>{{ value }}</ng-template>
      </target-content>`,
      { label: 'projected', selected: '' },
    );
    const target = ngMocks.findInstance(TargetComponent);
    const child = ngMocks.findInstance(ChildComponent);
    const items = ngMocks.findInstances(ChildDirective);

    expect(target.child).toBe(child);
    expect(isMockOf(child, ChildComponent)).toBe(true);
    expect(child.label).toBe('projected');
    expect(target.value).toBe('mock value');
    expect(target.directive).toBe(items[0]);
    expect(target.element && target.element.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(target.tpl && target.tpl.elementRef.nativeElement).toBe(
      ngMocks.findTemplateRef('tpl').elementRef.nativeElement,
    );
    expect(
      target.directItems && target.directItems.toArray(),
    ).toEqual([items[0]]);
    expect(target.allItems && target.allItems.toArray()).toEqual(
      items,
    );
    expect(items.map(item => item.contentItem)).toEqual([
      'direct',
      'nested',
    ]);

    child.selected.emit('chosen');
    expect(fixture.componentInstance.selected).toBe('chosen');
    expect(ngMocks.formatText(fixture)).not.toContain('real child');
  });

  it('leaves a missing child undefined and a missing collection empty', async () => {
    await MockBuilder(TargetComponent, TargetModule);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.child).toBeUndefined();
    expect(target.directive).toBeUndefined();
    expect(target.tpl).toBeUndefined();
    expect(
      target.directItems ? target.directItems.length : undefined,
    ).toBe(0);
    expect(target.allItems ? target.allItems.length : undefined).toBe(
      0,
    );
    expect(target.value).toBe('');
  });

  it('renders a projected template when its query owner is mocked', async () => {
    await MockBuilder().mock(TargetComponent);
    const fixture = MockRender(
      '<target-content><ng-template #tpl let-value>value: {{ value }}</ng-template></target-content>',
    );
    const target = ngMocks.findInstance(TargetComponent);
    const template = ngMocks.findTemplateRef('tpl');

    expect(target.tpl && target.tpl.elementRef.nativeElement).toBe(
      template.elementRef.nativeElement,
    );
    expect(ngMocks.formatText(fixture)).toBe('');

    ngMocks.render(target, template, 'rendered');
    expect(ngMocks.formatText(fixture)).toBe('value: rendered');

    ngMocks.hide(target, template);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
```
