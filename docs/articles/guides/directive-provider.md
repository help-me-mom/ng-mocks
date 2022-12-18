---
title: How to test a provider of a directive in Angular application
description: Covering a provider of an Angular directive with tests
sidebar_label: Provider of directive
---

This test is quite similar to ["How to test a provider of a component"](component-provider.md).
With difference that we need a bit different template.

Let's prepare `TestBed`: the service for testing is the first parameter, the directive is the second one:

```ts
beforeEach(() => MockBuilder(TargetService, TargetDirective));
```

A custom template for the test could look like:

```ts
const fixture = MockRender(`<div target></div>`);
```

Once we have the fixture we can extract the service from it and assert its behavior:

```ts
const service = fixture.point.injector.get(TargetService);
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestProviderInDirective/test.spec.ts&initialpath=%3Fspec%3DTestProviderInDirective)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestProviderInDirective/test.spec.ts&initialpath=%3Fspec%3DTestProviderInDirective)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestProviderInDirective/test.spec.ts"
import {
  Directive,
  ElementRef,
  Injectable,
  OnInit,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value = true;
}

// The purpose of the directive is to add a background color
// on mouseenter and to remove it on mouseleave.
@Directive({
  providers: [TargetService],
  selector: '[target]',
})
class TargetDirective implements OnInit {
  public constructor(
    public readonly service: TargetService,
    protected ref: ElementRef,
    protected templateRef: TemplateRef<void>,
    protected viewContainerRef: ViewContainerRef,
  ) {}

  public ngOnInit(): void {
    this.viewContainerRef.clear();
    if (this.service.value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    }
  }
}

describe('TestProviderInDirective', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder.
  // Because we do not care about TargetDirective, we pass it as
  // the second parameter for being replaced with a mock copy.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetDirective));

  it('has access to the service via a directive', () => {
    // Let's render a div with the directive.
    MockRender('<div target></div>');

    // Let's find the debugElement with the directive.
    // Please note, that we use ngMocks.find here.
    const el = ngMocks.find(TargetDirective);

    // Let's extract the service.
    const service = ngMocks.get(el, TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual(true);
  });

  it('has access to the service via a structural directive', () => {
    // Let's render a div with the directive.
    MockRender('<div *target></div>');

    // Let's find the debugNode with the directive.
    // Please note, that we use ngMocks.reveal here.
    const node = ngMocks.reveal(TargetDirective);

    // Let's extract the service.
    const service = ngMocks.get(node, TargetService);

    // Here we go, now we can assert everything about the service.
    expect(service.value).toEqual(true);
  });
});
```
