import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  NgModule,
  TemplateRef,
} from '@angular/core';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'xd-card',
  template: 'xd-card',
})
class XdCardComponent {
  @ContentChild('footer', {} as any)
  public readonly footer: TemplateRef<any> | undefined;

  @ContentChild('header', {} as any)
  public readonly header: TemplateRef<any> | undefined;
}

@Component({
  selector: 'target',
  template: `
    <xd-card>
      <ng-template #header>My Header</ng-template>
      <ng-template #footer>My Footer</ng-template>
    </xd-card>
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
    if (isMockOf(component, XdCardComponent, 'c')) {
      component.__render('header');
      component.__render('footer');
    }

    // asserting header
    const header = ngMocks.find('[data-key="header"]');
    expect(header.nativeElement.innerHTML).toContain('My Header');

    // asserting footer
    const footer = ngMocks.find('[data-key="footer"]');
    expect(footer.nativeElement.innerHTML).toContain('My Footer');
  });
});
