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
  public avoidCollisionMockTarget1() {}
}
```

And it will fix the Component ID collision.
