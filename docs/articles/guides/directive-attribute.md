---
title: How to test an attribute directive in Angular application
description: Covering an Angular attribute directive with tests
sidebar_label: Directive (attribute)
---

Attribute directives usually manipulate DOM, or mark a group of similar elements.
For a test, it means we need to render a custom template, where we use the directive, then we can assert its behavior.

Therefore, we should mock everything except the directive.
Or we can simply pass it alone if the directive does not have dependencies:

```ts
beforeEach(() => MockBuilder(TargetDirective));
```

The next step is to render a custom template. Let's assume that the selector of the directive is `[target]`.
Now let's render it in a test:

```ts
const fixture = MockRender(`<div target></div>`);
```

Because we use [`MockRender`](https://www.npmjs.com/package/ng-mocks#mockrender) we know that the element with the directive can be accessed by
`fixture.point`.

Now we can cause events the directive listens on,
or to access its instance for further assertions:

```ts
fixture.point.triggerEventHandler('mouseenter', null);
const instance = ngMocks.get(fixture.point, TargetDirective);
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestAttributeDirective/test.spec.ts&initialpath=%3Fspec%3DTestAttributeDirective)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestAttributeDirective/test.spec.ts&initialpath=%3Fspec%3DTestAttributeDirective)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestAttributeDirective/test.spec.ts"
import {
  Directive,
  ElementRef,
  HostListener,
  Input,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// The purpose of the directive is to add a background color
// on mouseenter and to remove it on mouseleave.
// By default the color is yellow.
@Directive({
  selector: '[target]',
})
class TargetDirective {
  @Input() public color = 'yellow';

  public constructor(protected ref: ElementRef) {}

  @HostListener('mouseenter') public onMouseEnter() {
    this.ref.nativeElement.style.backgroundColor = this.color;
  }

  @HostListener('mouseleave') public onMouseLeave() {
    this.ref.nativeElement.style.backgroundColor = '';
  }
}

describe('TestAttributeDirective', () => {
  ngMocks.faster(); // the same TestBed for several its.

  // Because we want to test the directive, we pass it as the first
  // parameter of MockBuilder. We can omit the second parameter,
  // because there are no dependencies.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetDirective));

  it('uses default background color', () => {
    const fixture = MockRender('<div target></div>');

    // By default, without the mouse enter, there is no background
    // color on the div.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      'style="background-color: yellow;"',
    );

    // Let's simulate the mouse enter event.
    // fixture.point is out root element from the rendered template,
    // therefore it points to the div we want to trigger the event
    // on.
    fixture.point.triggerEventHandler('mouseenter', null);

    // Let's assert the color.
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: yellow;"',
    );

    // Now let's simulate the mouse mouse leave event.
    fixture.point.triggerEventHandler('mouseleave', null);

    // And assert that the background color is gone now.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      'style="background-color: yellow;"',
    );
  });

  it('sets provided background color', () => {
    // When we want to test inputs / outputs we need to use the second
    // parameter of MockRender, simply pass there variables for the
    // template, they'll become properties of
    // fixture.componentInstance.
    const fixture = MockRender('<div [color]="color" target></div>', {
      color: 'red',
    });

    // Let's assert that the background color is red.
    fixture.point.triggerEventHandler('mouseenter', null);
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: red;"',
    );

    // Let's switch the color, we do not need `.point`, because we
    // access a middle component of MockRender.
    fixture.componentInstance.color = 'blue';
    fixture.detectChanges(); // shaking the template
    fixture.point.triggerEventHandler('mouseenter', null);
    expect(fixture.nativeElement.innerHTML).toContain(
      'style="background-color: blue;"',
    );
  });
});
```
