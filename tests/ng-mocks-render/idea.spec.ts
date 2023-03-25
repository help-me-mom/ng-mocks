import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  Input,
  NgModule,
  QueryList,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[tpl]',
})
class MockDirective {
  @Input('tpl') public readonly name: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Component({
  selector: 'mock-ng-mocks-render-idea',
  template: ' <ng-content></ng-content> ',
})
class MockComponent {
  @ContentChildren(MockDirective)
  public readonly directives?: QueryList<MockDirective>;

  @ContentChildren(MockDirective, {
    read: ViewContainerRef,
  } as any)
  public readonly directivesVcr?: QueryList<ViewContainerRef>;

  @ContentChild('header', {
    read: TemplateRef,
  } as any)
  public readonly id?: TemplateRef<any>;

  @ContentChild('header', {
    read: ViewContainerRef,
  } as any)
  public readonly idVcr?: ViewContainerRef;
}

@Component({
  selector: 'target-ng-mocks-render-idea',
  template: `
    <mock-ng-mocks-render-idea>
      :step:1:
      <ng-template #header>rendered-header</ng-template>
      :step:2:
      <ng-template tpl="header">tpl-header</ng-template>
      :step:3:
      <ng-template tpl="footer">tpl-footer</ng-template>
      :step:4:
    </mock-ng-mocks-render-idea>
  `,
})
class TargetComponent {}

@NgModule({
  declarations: [MockDirective, MockComponent, TargetComponent],
})
class TargetModule {}

describe('ng-mocks-render:idea', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('renders ids properly', () => {
    let html: any;
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.findInstance(MockComponent);

    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: :step:2:');

    // The idea is that the template will be rendered on its place.
    if (component.idVcr && component.id) {
      component.idVcr.createEmbeddedView(component.id);
      fixture.detectChanges();
    }
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: rendered-header :step:2:');
  });

  it('renders query lists properly', () => {
    let html: any;
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.findInstance(MockComponent);

    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:2: :step:3: :step:4:');

    // The idea is that the template will be rendered on its place.
    if (component.directivesVcr && component.directives) {
      const directivesVcr = component.directivesVcr.toArray();
      const directives = component.directives.toArray();
      for (let index = 0; index < directivesVcr.length; index += 1) {
        const vcr = directivesVcr[index];
        const directive = directives[index];
        if (vcr && directive && directive.tpl) {
          vcr.createEmbeddedView(directive.tpl);
        }
      }
      fixture.detectChanges();
    }
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(
      ':step:2: tpl-header :step:3: tpl-footer :step:4:',
    );
  });
});
