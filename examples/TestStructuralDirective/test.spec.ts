import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

// This directive is the same as `ngIf`,
// it renders its content only when its input has truly value.
@Directive({
  selector: '[target]',
})
class TargetDirective {
  protected templateRef: TemplateRef<any>;
  protected viewContainerRef: ViewContainerRef;

  constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    this.templateRef = templateRef;
    this.viewContainerRef = viewContainerRef;
  }

  @Input() set target(value: any) {
    if (value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}

describe('TestStructuralDirective', () => {
  // Because we want to test the directive, we pass it as the first
  // argument of MockBuilder. We can omit the second argument,
  // because there are no dependencies.
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
      }
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
