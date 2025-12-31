import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

interface ITargetContext {
  $implicit: string;
  myIndex: number;
}

// This directive is almost the same as `ngFor`,
// it renders every item as a new row.
@Directive({
  selector: '[target]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  public constructor(
    protected templateRef: TemplateRef<ITargetContext>,
    protected viewContainerRef: ViewContainerRef,
  ) {}

  @Input() public set target(items: string[]) {
    this.viewContainerRef.clear();

    for (let index = 0; index < items.length; index += 1) {
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

  it('renders passed items', () => {
    const fixture = MockRender(
      `
        <div *target="items; let value; let index = myIndex">
        {{index}}: {{ value }}
        </div>
      `,
      {
        items: ['hello', 'world'],
      },
    );

    // Let's assert that the 'items' have been rendered as expected
    expect(fixture.nativeElement.innerHTML).toContain('0: hello');
    expect(fixture.nativeElement.innerHTML).toContain('1: world');

    // Let's change the 'items' and assert that the new render
    // has done everything as expected.
    fixture.componentInstance.items = ['ngMocks'];
    fixture.detectChanges();
    expect(fixture.nativeElement.innerHTML).toContain('0: ngMocks');
    expect(fixture.nativeElement.innerHTML).not.toContain('0: hello');
    expect(fixture.nativeElement.innerHTML).not.toContain('1: world');
  });
});
