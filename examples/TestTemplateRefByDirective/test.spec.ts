import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Directive,
  Input,
  NgModule,
  QueryList,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[xdTpl]',
})
class XdTplDirective {
  @Input() public readonly xdTpl: 'header' | 'footer' | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Component({
  selector: 'xd-card-template-ref-by-directive',
  template: 'xd-card',
})
class XdCardComponent {
  @ContentChildren(XdTplDirective, {} as any)
  public readonly templates?: QueryList<XdTplDirective>;
}

@Component({
  selector: 'target-template-ref-by-directive',
  template: `
    <xd-card-template-ref-by-directive>
      <ng-template xdTpl="header">My Header</ng-template>
      <ng-template xdTpl="footer">My Footer</ng-template>
    </xd-card-template-ref-by-directive>
  `,
})
class TargetComponent {}

@NgModule({
  declarations: [XdTplDirective, XdCardComponent, TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

describe('TestTemplateRefByDirective', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('receives right templates', () => {
    MockRender(TargetComponent);

    // looking for the element
    // which is produced
    // by the desired component
    const container = ngMocks.find(
      'xd-card-template-ref-by-directive',
    );

    // fetching elements with directives
    const [header, footer] = ngMocks.findInstances(
      container,
      XdTplDirective,
    );

    // asserting header
    expect(header.xdTpl).toEqual('header');
    ngMocks.render(header, header);
    expect(container.nativeElement.innerHTML).toContain('My Header');

    // asserting footer
    expect(footer.xdTpl).toEqual('footer');
    ngMocks.render(footer, footer);
    expect(container.nativeElement.innerHTML).toContain('My Footer');
  });
});
