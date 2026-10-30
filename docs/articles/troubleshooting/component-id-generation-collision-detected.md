---
title: 'How to fix Component ID generation collision detected'
description: A solution for to customize components with the same selector
sidebar_label: Component ID collision
---

Starting Angular 16, the framework tries to [generate consistent ids for components](https://github.com/angular/angular/commit/0e5f9ba6f427a79a0b741c1780cd2ff72cc3100a#diff-4374dd238deae3e4714315fc97bb9983092ada87475d8e0b8d28e191571941deR668).
However, it can come to a collision if the decorator and the class of components look the same.

For example, the code below has 2 different classes which will cause a **collision** due to their similarity.
It can be easily reproduced in a test where we want to replace a component with a mock and an empty template:

```ts
@Component({
  selector: 'target',
  template: 'complex-template',
})
class TargetComponent {}

@Component({
  selector: 'target',
  template: 'empty-template',
})
class MockTargetComponent {}
```

:::caution Throws the error
Component ID generation collision detected. Components 'Target1Component' and 'MockTarget1Component' with selector 'target' generated the same component ID. To fix this, you can change the selector of one of those components or add an extra host attribute to force a different ID. 
:::

## Recommended fix

As the error suggests, we can add a **unique host attribute to fix the collision**.
For that, we should use the `host` property of `@Component` decorator with a unique value.
For example, we can use the name of the class:

```ts
@Component({
  selector: 'target',
  template: 'complex-template',
  host: {'collision-id': 'Target1Component'},
})
export class Target1Component {}

@Component({
  selector: 'target',
  template: 'empty-template',
  host: {'collision-id': 'MockTarget1Component'},
})
export class MockTarget1Component {}
```

:::note Don't use randomizers
The idea of a Component ID is to represent the same component in any circumstances: despite its position in imports or other factors.
Because of that, the Component ID should be predictable. So, please, don't use randomizers such as `Math.random()` etc.
:::

### Alternative fix

If you don't like `host` approach, you can **add a stub method with a unique name to avoid Component ID collision**.
For example, in the mock class, we can add `avoidCollisionMockTarget1`:

```ts
@Component({
  selector: 'target',
  template: 'complex-template',
})
export class Target1Component {}

@Component({
  selector: 'target',
  template: 'empty-template',
})
export class MockTarget1Component {
  public avoidCollisionMockTarget1(): void {}
}
```

And it will fix the Component ID collision.

## Directive test helpers in Angular 22.2+

Angular 22.2+ includes its own `DirectiveTestHost` component with the selector
`div[ng-directive-test-component]`. An empty local helper using the same selector
can have matching metadata, including when it attaches a directive through
`hostDirectives`. Renaming the helper class alone does not distinguish its ID:
Angular uses component metadata and prototype property names, rather than the class name.

In JIT tests, [`MockComponent`](/api/MockComponent.md) reads the original component's
metadata before creating its mock. That inspection can compile the original helper
and report its collision with Angular's host. Give the **original helper** a distinct
selector or a deterministic static host attribute before passing it to `MockComponent`.

The example below adds `data-directive-host` to the original helper. The first test
uses the real helper to exercise `TargetDirective`. The second checks that the helper
can also be mocked before the test hooks run.

- [Try it on CodeSandbox](https://codesandbox.io/p/sandbox/github/help-me-mom/ng-mocks-sandbox/tree/tests/?file=/src/examples/MockComponent/collision.spec.ts&initialpath=%3Fspec%3DMockComponent%3Acollision)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockComponent/collision.spec.ts&initialpath=%3Fspec%3DMockComponent%3Acollision)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/main/examples/MockComponent/collision.spec.ts"
import { Component, Directive, ViewEncapsulation } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

@Directive()
class TargetDirective {
  public readonly value = 'real directive';
}

// Attach the directive to the empty helper's own host element.
@Component({
  selector: 'div[ng-directive-test-component]',
  template: '',
  encapsulation: ViewEncapsulation.None,
  host: { 'data-directive-host': 'target-directive' },
  hostDirectives: [TargetDirective],
})
class DirectiveTestHost {}

// Distinguish the original helper before MockComponent inspects it.
const mockedDirectiveTestHost = MockComponent(DirectiveTestHost);

describe('MockComponent:collision', () => {
  ngMocks.throwOnConsole();

  it('uses the real helper to test the directive', async () => {
    await TestBed.configureTestingModule({
      imports: [DirectiveTestHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(DirectiveTestHost);
    fixture.detectChanges();

    expect(fixture.debugElement.injector.get(TargetDirective).value).toBe(
      'real directive',
    );
    expect(fixture.nativeElement.dataset.directiveHost).toBe(
      'target-directive',
    );
  });

  it('renders the mock created before the test hooks', async () => {
    await TestBed.configureTestingModule({
      imports: [mockedDirectiveTestHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(mockedDirectiveTestHost);
    fixture.detectChanges();

    expect(isMockOf(fixture.componentInstance, DirectiveTestHost)).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
```
