---
title: How to mock a dynamic component
description: Mocking an Angular dynamic component
sidebar_label: Dynamic Components
---

Angular has introduced a way how to render components dynamically.
Now, it can be done via `ViewContainerRef.createComponent(DynamicComponent)`,
and components, which are rendering dynamic components, usually, look like:

```ts
@Component({
  standalone: true,
  selector: 'main',
  template: '',
})
export class MainComponent implements OnInit {
  // ViewContainerRef is needed to manager rendering
  constructor(public readonly containerRef: ViewContainerRef) {}

  async ngOnInit() {
    // loading DynamicComponent 
    const { DynamicComponent } = await import('./dynamic.component');
    
    // rendering DynamicComponent
    this.containerRef.createComponent(DynamicComponent);
  }
}
```

In unit tests, developers might need to mock `DynamicComponent` to relieve testing.
Their goal is to assert that `MainComponent` has rendered `DynamicComponent` under defined circumstances
and suppress what `DynamicComponent` does under the hood. 

This can be achieved with help of `ng-mocks` and [`MockBuilder`](../../api/MockBuilder.md),
simply pass `DynamicComponent` as mock dependency:

```ts
beforeEach(() => MockBuilder(MainComponent, DynamicComponent));
```

In this case, `ng-mocks` will mock `DynamicComponent` and render its stub.

:::tip
`ng-mocks` intercepts the call of `ViewContainerRef.createComponent()`, not `import()`.
:::


## An example how to mock dynamic components

```ts
import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { DynamicComponent } from './dynamic.component';

@Component({
  standalone: true,
  selector: 'main',
  template: '',
})
class MainComponent implements OnInit {
  // ViewContainerRef is needed to manager rendering
  constructor(public readonly containerRef: ViewContainerRef) {}

  async ngOnInit() {
    // loading DynamicComponent 
    const { DynamicComponent } = await import('./dynamic.component');
    
    // rendering DynamicComponent
    this.containerRef.createComponent(DynamicComponent);
  }
}

describe('suite', () => {
  beforeEach(() => MockBuilder(MainComponent, DynamicComponent));

  it('loads lazy component as a mock', async () => {
    // loading the MainComponent and waiting for its initialization
    const fixture = MockRender(MainComponent);
    await fixture.whenStable();
    
    // asserting that DynamicComponent has been rendered
    const el = ngMocks.find(DynamicComponent, undefined);
    expect(el).toBeDefined();
  });
});

```
