import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  NgModule,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'xd-card-template-ref-by-id',
  template: 'xd-card',
})
class XdCardComponent {
  @ContentChild('footer', {} as any)
  public readonly footer: TemplateRef<any> | undefined;

  @ContentChild('header', {} as any)
  public readonly header: TemplateRef<any> | undefined;
}

@Component({
  selector: 'target-template-ref-by-id',
  template: `
    <xd-card-template-ref-by-id>
      <ng-template #header>My Header</ng-template>
      <ng-template #footer>My Footer</ng-template>
    </xd-card-template-ref-by-id>
  `,
})
class TargetComponent {}

@NgModule({
  declarations: [XdCardComponent, TargetComponent],
  imports: [CommonModule],
})
class TargetModule {}

describe('TestTemplateRefById', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('receives right templates', () => {
    MockRender(TargetComponent);

    // looking for the instance
    const component = ngMocks.findInstance(XdCardComponent);

    // checking that the component is a mock
    ngMocks.render(component, ngMocks.findTemplateRef('header'));
    ngMocks.render(component, ngMocks.findTemplateRef('footer'));

    const container = ngMocks.find(XdCardComponent);

    // asserting header
    expect(container.nativeElement.innerHTML).toContain('My Header');

    // asserting footer
    expect(container.nativeElement.innerHTML).toContain('My Footer');
  });
});
