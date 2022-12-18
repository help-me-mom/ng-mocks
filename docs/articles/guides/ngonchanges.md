---
title: How to test ngOnChanges lifecycle hook in Angular application
description: Covering an Angular ngOnChanges lifecycle hook with tests
sidebar_label: ngOnChanges lifecycle hook
---

`TestBed.createComponent` does not support `ngOnChanges` out of the box.
That is where [`MockRender`](https://www.npmjs.com/package/ng-mocks#mockrender) might be helpful.

Simply use it instead of `TestBed.createComponent`.

```ts
const fixture = MockRender(TargetComponent, {
  input: '',
});
// The hook has been already called here.
```

Changes of parameters will trigger the hook.

```ts
fixture.componentInstance.input = 'change';
fixture.detectChanges(); // <- triggers the hook again.
// Here we can do desired assertions.
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestLifecycleHooks/test.spec.ts&initialpath=%3Fspec%3DTestHttpRequest)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestLifecycleHooks/test.spec.ts&initialpath=%3Fspec%3DTestHttpRequest)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestLifecycleHooks/test.spec.ts"
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  TargetComponent,
  TargetModule,
  TargetService,
} from './fixtures';

describe('TestLifecycleHooks', () => {
  ngMocks.faster();

  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('triggers lifecycle hooks correctly via mock-render w/ params', () => {
    // First let's suppress detectChanges.
    const fixture = MockRender(
      TargetComponent,
      {
        input: '',
      },
      { detectChanges: false },
    );

    const service: TargetService =
      fixture.point.injector.get(TargetService);

    // By default nothing should be initialized, but ctor.
    expect(service.ctor).toHaveBeenCalledTimes(1); // changed
    expect(service.onInit).toHaveBeenCalledTimes(0);
    expect(service.onDestroy).toHaveBeenCalledTimes(0);
    expect(service.onChanges).toHaveBeenCalledTimes(0);
    expect(service.afterViewInit).toHaveBeenCalledTimes(0);
    expect(service.afterViewChecked).toHaveBeenCalledTimes(0);
    expect(service.afterContentInit).toHaveBeenCalledTimes(0);
    expect(service.afterContentChecked).toHaveBeenCalledTimes(0);

    // Now let's render the component.
    fixture.detectChanges();

    // This calls everything except onDestroy and onChanges.
    expect(service.ctor).toHaveBeenCalledTimes(1);
    expect(service.onInit).toHaveBeenCalledTimes(1); // changed
    expect(service.onDestroy).toHaveBeenCalledTimes(0);
    expect(service.onChanges).toHaveBeenCalledTimes(1); // changed
    expect(service.afterViewInit).toHaveBeenCalledTimes(1); // changed
    expect(service.afterViewChecked).toHaveBeenCalledTimes(1); // changed
    expect(service.afterContentInit).toHaveBeenCalledTimes(1); // changed
    expect(service.afterContentChecked).toHaveBeenCalledTimes(1); // changed

    // Let's change it.
    fixture.componentInstance.input = 'change';
    fixture.detectChanges();

    // Only OnChange, AfterViewChecked, AfterContentChecked
    // should be triggered.
    expect(service.ctor).toHaveBeenCalledTimes(1);
    expect(service.onInit).toHaveBeenCalledTimes(1);
    expect(service.onDestroy).toHaveBeenCalledTimes(0);
    expect(service.onChanges).toHaveBeenCalledTimes(2); // changed
    expect(service.afterViewInit).toHaveBeenCalledTimes(1);
    expect(service.afterViewChecked).toHaveBeenCalledTimes(2); // changed
    expect(service.afterContentInit).toHaveBeenCalledTimes(1);
    expect(service.afterContentChecked).toHaveBeenCalledTimes(2); // changed

    // Let's cause more changes.
    fixture.detectChanges();
    fixture.detectChanges();

    // Only AfterViewChecked, AfterContentChecked should be triggered.
    expect(service.ctor).toHaveBeenCalledTimes(1);
    expect(service.onInit).toHaveBeenCalledTimes(1);
    expect(service.onDestroy).toHaveBeenCalledTimes(0);
    expect(service.onChanges).toHaveBeenCalledTimes(2);
    expect(service.afterViewInit).toHaveBeenCalledTimes(1);
    expect(service.afterViewChecked).toHaveBeenCalledTimes(4); // changed
    expect(service.afterContentInit).toHaveBeenCalledTimes(1);
    expect(service.afterContentChecked).toHaveBeenCalledTimes(4); // changed

    // Let's destroy it.
    fixture.destroy();

    // This all calls except onDestroy and onChanges.
    expect(service.ctor).toHaveBeenCalledTimes(1);
    expect(service.onInit).toHaveBeenCalledTimes(1);
    expect(service.onDestroy).toHaveBeenCalledTimes(1); // changed
    expect(service.onChanges).toHaveBeenCalledTimes(2);
    expect(service.afterViewInit).toHaveBeenCalledTimes(1);
    expect(service.afterViewChecked).toHaveBeenCalledTimes(4);
    expect(service.afterContentInit).toHaveBeenCalledTimes(1);
    expect(service.afterContentChecked).toHaveBeenCalledTimes(4);
  });

  it('does not trigger onChanges correctly via TestBed.createComponent', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.componentInstance.input = '';

    const service: TargetService =
      fixture.debugElement.injector.get(TargetService);

    // By default, nothing should be initialized.
    expect(service.onChanges).toHaveBeenCalledTimes(0);

    // Now let's render the component.
    fixture.detectChanges();

    // The hook should have been called, but not via TestBed.createComponent.
    expect(service.onChanges).toHaveBeenCalledTimes(0); // failed

    // Let's change it.
    fixture.componentInstance.input = 'change';
    fixture.changeDetectorRef.detectChanges();

    // The hook should have been called, but not via TestBed.createComponent.
    expect(service.onChanges).toHaveBeenCalledTimes(0); // failed
  });
});
```
