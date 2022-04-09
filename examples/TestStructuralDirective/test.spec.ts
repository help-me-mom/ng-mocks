import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// This directive is the same as `ngIf`,
// it renders its content only when its input has truly value.
@Directive({
  selector: '[target]',
})
class TargetDirective {
  public constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainerRef: ViewContainerRef,
  ) {}

  @Input() public set target(value: any) {
    if (value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}

describe('TestStructuralDirectiveWithoutContext', () => {
  // Because we want to test the directive, we pass it as the first
  // parameter of MockBuilder. We can omit the second parameter,
  // because there are no dependencies.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetDirective));

  it('hides and renders its content', () => {
    const fixture = MockRender(
      `
        <div *target="value">
          content
        </div>
    `,
      {
        value: false,
      },
    );

    // Because the value is false the "content" should not be
    // rendered.
    expect(fixture.nativeElement.innerHTML).not.toContain('content');

    // Let's change the value to true and assert that the "content"
    // has been rendered.
    fixture.componentInstance.value = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('content');

    // Let's change the value to false and assert that the
    // "content" has been hidden.
    fixture.componentInstance.value = false;
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).not.toContain('content');
  });
});
