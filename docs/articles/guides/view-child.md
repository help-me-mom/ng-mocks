---
title: How to test a ViewChild / ViewChildren of a declaration
description: Mocking child dependencies which a fetched via ViewChild or ViewChildren
sidebar_label: ViewChild / ViewChildren
---

When we want to test a `ViewChild` or `ViewChildren`,
or a logic which depends on them,
it means, that we have child dependencies which derive from components or directives.

Therefore, the best way to write a test is to use their mock objects in the test.

Let's assume that we want to test a `TargetComponent` and its code looks like:

```ts title="target.component.ts"
@Component({
  selector: 'target',
  templateUrl: './target.component.html',
})
class TargetComponent {
  @ViewChild(DependencyComponent)
  public component?: DependencyComponent;

  @ViewChild(DependencyComponent, {
    read: DependencyDirective,
  })
  public directive?: DependencyDirective;

  @ViewChildren(DependencyDirective)
  public directives?: QueryList<DependencyDirective>;

  @ViewChild('tpl')
  public tpl?: TemplateRef<HTMLElement>;

  public value = '';
}
```

and its template is the next:

```html title="target.component.html"
<dependency
  [dependency]="0"
  (trigger)="value = $event"
></dependency>
<div>
  <span
    [dependency]="1"
    (trigger)="value = $event"
  >1</span>
  <span
    [dependency]="2"
    (trigger)="value = $event"
  >2</span>
  <span
    [dependency]="3"
    (trigger)="value = $event"
  >3</span>
</div>
<ng-template #tpl>
  {{ value }}
</ng-template>
```

In this case, we can use [`MockBuilder`](../api/MockBuilder.md),
Let's pass `TargetComponent` as the first parameter, and its module
as the second one into [`MockBuilder`](../api/MockBuilder.md).
Then `DependencyComponent` and `DependencyDirective` will be replaced
with their mocks, therefore we can use fake emits and provide custom behavior if it is needed.

```ts
// do not forget to return
// the result of MockBuilder 
beforeEach(() => MockBuilder(
  TargetComponent,
  TargetModule,
));
```

In the test, we can access the mock declarations via normal queries
or via [`ngMocks.findInstance`](../api/ngMocks/findInstance.md).

For example, if we wanted to simulate an emit of the child component,
we could call it like that:

```ts
ngMocks
  .findInstance(DependencyComponent)
  .trigger
  .emit('component');
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestViewChild/test.spec.ts&initialpath=%3Fspec%3DTestViewChild)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestViewChild/test.spec.ts&initialpath=%3Fspec%3DTestViewChild)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestViewChild/test.spec.ts"
import {
  Component,
  Directive,
  EventEmitter,
  Input,
  NgModule,
  Output,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewChildren,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'dependency',
  template: 'dependency',
})
class DependencyComponent {
  @Input() public dependency: number | null = null;

  @Output() public readonly trigger = new EventEmitter<string>();
}

@Directive({
  selector: '[dependency]',
})
class DependencyDirective {
  @Input() public dependency: number | null = null;

  @Output() public readonly trigger = new EventEmitter<string>();
}

@Component({
  selector: 'target',
  template: `
    <dependency
      [dependency]="0"
      (trigger)="value = $event"
    ></dependency>
    <div>
      <span [dependency]="1" (trigger)="value = $event">1</span>
      <span [dependency]="2" (trigger)="value = $event">2</span>
      <span [dependency]="3" (trigger)="value = $event">3</span>
    </div>
    <ng-template #tpl>
      {{ value }}
    </ng-template>
  `,
})
class TargetComponent {
  @ViewChild(DependencyComponent)
  public component?: DependencyComponent;

  @ViewChild(DependencyComponent, {
    read: DependencyDirective,
  })
  public directive?: DependencyDirective;

  @ViewChildren(DependencyDirective)
  public directives?: QueryList<DependencyDirective>;

  @ViewChild('tpl')
  public tpl?: TemplateRef<HTMLElement>;

  public value = '';
}

@NgModule({
  declarations: [
    DependencyComponent,
    DependencyDirective,
    TargetComponent,
  ],
  exports: [TargetComponent],
})
class TargetModule {}

describe('TestViewChild', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('provides mock dependencies', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // checking @ViewChild(DependencyComponent)
    expect(component.component).toEqual(
      jasmine.any(DependencyComponent),
    );
    expect(
      component.component && component.component.dependency,
    ).toEqual(0);

    // checking its read: DependencyDirective
    expect(component.directive).toEqual(
      jasmine.any(DependencyDirective),
    );
    expect(
      component.directive && component.directive.dependency,
    ).toEqual(0);

    // checking TemplateRef
    expect(component.tpl).toEqual(jasmine.any(TemplateRef));

    // @ViewChildren(DependencyDirective)
    if (!component.directives) {
      throw new Error('component.directives are missed');
    }
    expect(component.directives.length).toEqual(4);
    const [dir0, dir1, dir2, dir3] = component.directives.toArray();
    expect(dir0 && dir0.dependency).toEqual(0);
    expect(dir1 && dir1.dependency).toEqual(1);
    expect(dir2 && dir2.dependency).toEqual(2);
    expect(dir3 && dir3.dependency).toEqual(3);

    // asserting outputs of DependencyComponent
    expect(component.value).toEqual('');
    ngMocks
      .findInstance(DependencyComponent)
      .trigger.emit('component');
    expect(component.value).toEqual('component');

    // asserting outputs DependencyDirective
    ngMocks
      .findInstances(DependencyDirective)[0]
      .trigger.emit('dir0');
    expect(component.value).toEqual('dir0');

    ngMocks
      .findInstances(DependencyDirective)[1]
      .trigger.emit('dir1');
    expect(component.value).toEqual('dir1');

    ngMocks
      .findInstances(DependencyDirective)[2]
      .trigger.emit('dir2');
    expect(component.value).toEqual('dir2');

    ngMocks
      .findInstances(DependencyDirective)[3]
      .trigger.emit('dir3');
    expect(component.value).toEqual('dir3');
  });
});
```
