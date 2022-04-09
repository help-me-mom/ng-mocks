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

describe('TestDirectiveLetOf:static', () => {
  beforeEach(() =>
    MockBuilder().mock(DxTemplateDirective, {
      // We should not only render the structural directive,
      // but also provide its context variables.
      render: {
        $implicit: {
          data: 'MOCK_DATA',
        },
      },
    }),
  );

  it('renders a mock of structural directives', () => {
    const fixture = MockRender(`
      <div *dxTemplate="let cellTemplate of 'actionsCellTemplate'">
        {{ cellTemplate.data }}
      </div>
    `);

    // firstly, let's check that we passed 'actionsCellTemplate' as input value.
    expect(
      ngMocks.findInstance(DxTemplateDirective).dxTemplateOf,
    ).toEqual('actionsCellTemplate');

    // secondly, let's check that MOCK_DATA has been rendered.
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<div> MOCK_DATA </div>',
    );
  });
});
