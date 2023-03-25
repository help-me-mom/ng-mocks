import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  Input,
  NgModule,
  QueryList,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[tpl]',
})
class TplDirective {
  @Input('tpl') public readonly name: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  selector: '[mock]',
})
class MockDirective {
  @ContentChild(TplDirective, {} as any)
  public readonly tpl?: TplDirective;
}

@Component({
  selector: 'mock-ng-mocks-render-directive',
  template: '',
})
class MockComponent {
  @ContentChildren(MockDirective)
  public readonly directives?: QueryList<MockDirective>;

  @ContentChildren(TplDirective, {
    read: TemplateRef,
  } as any)
  public readonly templates?: QueryList<TemplateRef<any>>;
}

@Component({
  selector: 'target-ng-mocks-render-directive',
  template: `
    <mock-ng-mocks-render-directive>
      :step:1:
      <ng-template tpl="header">rendered-header</ng-template>
      :step:2:
      <div mock>
        :step:3:
        <ng-template tpl="body">rendered-body</ng-template>
        :step:4:
      </div>
      :step:5:
    </mock-ng-mocks-render-directive>
  `,
})
class TargetComponent {}

@NgModule({
  declarations: [
    TargetComponent,
    MockComponent,
    MockDirective,
    TplDirective,
  ],
  imports: [CommonModule],
})
class TargetModule {}

describe('ng-mocks-render:directive', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders directives in components', () => {
    let html = '';
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.findInstance(MockComponent);

    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: :step:2:');
    const directiveHeader = ngMocks.findInstance(TplDirective);
    expect(directiveHeader.name).toEqual('header');
    ngMocks.render(component, directiveHeader);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: rendered-header :step:2:');

    expect(html).toContain(':step:3: :step:4:');
    const directiveEl = ngMocks.find(MockDirective);
    const directiveBody = ngMocks.findInstance(
      directiveEl,
      TplDirective,
    );
    expect(directiveBody.name).toEqual('body');
    ngMocks.render(component, directiveBody);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: rendered-body :step:4:');

    expect(html).toContain(':step:1: rendered-header :step:2:');
    ngMocks.hide(component, directiveHeader);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: :step:2:');

    expect(html).toContain(':step:3: rendered-body :step:4:');
    ngMocks.hide(component, directiveBody);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: :step:4:');
  });

  it('renders directives in directives', () => {
    let html = '';
    const fixture = MockRender(TargetComponent);
    const directive = ngMocks.findInstance(MockDirective);

    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: :step:4:');
    const [, directiveBody] = ngMocks.findInstances(TplDirective);
    expect(directiveBody.name).toEqual('body');
    ngMocks.render(directive, directiveBody);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: rendered-body :step:4:');

    expect(html).toContain(':step:3: rendered-body :step:4:');
    ngMocks.hide(directive, directiveBody);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: :step:4:');
  });

  it('renders self directives', () => {
    let html = '';
    const fixture = MockRender(TargetComponent);
    const [directiveHeader, directiveBody] =
      ngMocks.findInstances(TplDirective);

    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: :step:2:');
    ngMocks.render(directiveHeader, directiveHeader);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: rendered-header :step:2:');

    expect(html).toContain(':step:3: :step:4:');
    ngMocks.render(directiveBody, directiveBody);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: rendered-body :step:4:');

    expect(html).toContain(':step:1: rendered-header :step:2:');
    ngMocks.hide(directiveHeader, directiveHeader);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: :step:2:');

    expect(html).toContain(':step:3: rendered-body :step:4:');
    ngMocks.hide(directiveBody, directiveBody);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: :step:4:');
  });
});
