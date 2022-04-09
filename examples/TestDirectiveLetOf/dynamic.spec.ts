import {
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[dxTemplate]',
})
class DxTemplateDirective {
  @Input() public readonly dxTemplateOf: string | null = null;

  public constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainerRef: ViewContainerRef,
  ) {}
}

describe('TestDirectiveLetOf:dynamic', () => {
  beforeEach(() => MockBuilder().mock(DxTemplateDirective));

  it('renders a mock of structural directives', () => {
    const fixture = MockRender(`
      <div *dxTemplate="let cellTemplate of 'actionsCellTemplate'">
        {{ cellTemplate.data }}
      </div>
    `);

    // firstly, let's check that we passed 'actionsCellTemplate' as input value.
    const instance = ngMocks.findInstance(DxTemplateDirective);
    expect(instance.dxTemplateOf).toEqual('actionsCellTemplate');

    // secondly, let's render the structural directive,
    // and assert that MOCK_DATA is present.
    ngMocks.render(instance, instance, {
      data: 'MOCK_DATA',
    });
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<div> MOCK_DATA </div>',
    );
  });
});
