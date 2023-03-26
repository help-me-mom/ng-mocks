import {
  Component,
  Directive,
  Input,
  NgModule,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dependency]',
})
class DependencyDirective {
  @Input('dependency')
  public someInput = '';

  public constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainerRef: ViewContainerRef,
  ) {}
}

@Component({
  selector: 'target',
  template: '<span *dependency="value">content</span>',
})
class TargetComponent {
  public value = '';

  public childMockDirectiveStructural() {}
}

@NgModule({
  declarations: [TargetComponent, DependencyDirective],
})
class ItsModule {}

describe('MockDirective:Structural', () => {
  // IMPORTANT: by default structural directives are not rendered.
  // Because they might require a context which should be provided.
  // Usually a developer knows the context and can render it
  // manually with proper setup.
  beforeEach(() => {
    // DependencyDirective is a declaration in ItsModule.
    return MockBuilder(TargetComponent, ItsModule).mock(
      DependencyDirective,
      {
        // render: true, // <-- a flag to render the directive by default
      },
    );
  });

  it('renders content of the child structural directive', () => {
    const fixture = MockRender(TargetComponent);

    // Let's assert that nothing has been rendered inside
    // the structural directive by default.
    expect(fixture.nativeElement.innerHTML).not.toContain(
      '>content<',
    );

    // And let's render it manually now.
    const mockDirective = ngMocks.findInstance(DependencyDirective);
    ngMocks.render(mockDirective, mockDirective);

    // The content of the structural directive should be rendered.
    expect(fixture.nativeElement.innerHTML).toContain('>content<');
  });
});
