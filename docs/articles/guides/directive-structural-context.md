---
title: How to test a structural directive with a context in Angular application
description: Covering an Angular structural directive with a context with tests
sidebar_label: Structural directive with context
---

If you did not read ["How to test a structural directive"](directive-structural.md), please do it first.

The difference for structural directives with a context in terms of testing is that our custom template has variables.

```ts
const fixture = MockRender(
  `<div *target="values; let value; let index = myIndex">
    {{index}}: {{ value }}
  </div>`,
  {
    values: ['hello', 'world'],
  }
);
```

This directive simulates behavior of `*ngFor`. We can do different assertions checking rendered html, and to verify how the
directive behaves when we are changing `values`:

```ts
expect(fixture.nativeElement.innerHTML).toContain('0: hello');
expect(fixture.nativeElement.innerHTML).toContain('1: world');
```

```ts
fixture.componentInstance.values = ['ng-mocks'];
fixture.detectChanges();
expect(fixture.nativeElement.innerHTML).toContain('0: ng-mocks');
expect(fixture.nativeElement.innerHTML).not.toContain('0: hello');
expect(fixture.nativeElement.innerHTML).not.toContain('1: world');
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestStructuralDirectiveWithContext/test.spec.ts&initialpath=%3Fspec%3DTestStructuralDirectiveWithContext)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestStructuralDirectiveWithContext/test.spec.ts&initialpath=%3Fspec%3DTestStructuralDirectiveWithContext)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestStructuralDirectiveWithContext/test.spec.ts"
import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

export interface ITargetContext {
  $implicit: string;
  myIndex: number;
}

// This directive is almost the same as `ngFor`,
// it renders every item as a new row.
@Directive({
  selector: '[target]',
})
class TargetDirective {
  public constructor(
    protected templateRef: TemplateRef<ITargetContext>,
    protected viewContainerRef: ViewContainerRef,
  ) {}

  @Input() public set target(items: string[]) {
    this.viewContainerRef.clear();

    for (let index = 0; index <= items.length; index += 1) {
      const value = items[index];
      this.viewContainerRef.createEmbeddedView(this.templateRef, {
        $implicit: value,
        myIndex: index,
      });
    }
  }
}

describe('TestStructuralDirectiveWithContext', () => {
  // Because we want to test the directive, we pass it as the first
  // parameter of MockBuilder. We can omit the second parameter,
  // because there are no dependencies.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetDirective));

  it('renders passed values', () => {
    const fixture = MockRender(
      `
        <div *target="values; let value; let index = myIndex">
        {{index}}: {{ value }}
        </div>
      `,
      {
        values: ['hello', 'world'],
      },
    );

    // Let's assert that the 'values' have been rendered as expected
    expect(fixture.nativeElement.innerHTML).toContain('0: hello');
    expect(fixture.nativeElement.innerHTML).toContain('1: world');

    // Let's change the 'values' and assert that the new render
    // has done everything as expected.
    fixture.componentInstance.values = ['ngMocks'];
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('0: ngMocks');
    expect(fixture.nativeElement.innerHTML).not.toContain('0: hello');
    expect(fixture.nativeElement.innerHTML).not.toContain('1: world');
  });
});
```
