import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';
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
  protected templateRef: TemplateRef<ITargetContext>;
  protected viewContainerRef: ViewContainerRef;

  constructor(templateRef: TemplateRef<ITargetContext>, viewContainerRef: ViewContainerRef) {
    this.templateRef = templateRef;
    this.viewContainerRef = viewContainerRef;
  }

  @Input() set target(items: string[]) {
    this.viewContainerRef.clear();

    items.forEach((value, index) =>
      this.viewContainerRef.createEmbeddedView(this.templateRef, {
        $implicit: value,
        myIndex: index,
      })
    );
  }
}

describe('TestStructuralDirectiveWithContext', () => {
  // Because we want to test the directive, we pass it as the first
  // parameter of MockBuilder. We can omit the second parameter,
  // because there are no dependencies.
  beforeEach(() => MockBuilder(TargetDirective));

  it('renders passed values', () => {
    const fixture = MockRender(
      `
        <div *target="values; let value; let index = myIndex">
        {{index}}: {{ value }}
        </div>`,
      {
        values: ['hello', 'world'],
      }
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
