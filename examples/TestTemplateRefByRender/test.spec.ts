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
  selector: '[myTpl]',
})
class MyTplDirective {
  @Input('myTpl') public readonly name: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Component({
  selector: 'xd-card-template-ref-by-render',
  template: '',
})
class XdCardComponent {
  @ContentChild('id', {} as any)
  public readonly id?: TemplateRef<any>;

  @ContentChildren(MyTplDirective, {} as any)
  public readonly templates?: QueryList<MyTplDirective>;
}

@NgModule({
  declarations: [MyTplDirective, XdCardComponent],
  imports: [CommonModule],
})
class TargetModule {}

describe('TestTemplateRefByRender', () => {
  beforeEach(() => MockBuilder(null, TargetModule));

  beforeEach(() =>
    MockRender(`
    <xd-card-template-ref-by-render>
      <ng-template #id let-label="label">
        rendered-id-{{ label }}
      </ng-template>

      <ng-template myTpl="header" let-label>
        rendered-header-{{ label }}
      </ng-template>

      <span my-tpl *myTpl="'footer'; let label">
        rendered-footer-{{ label }}
      </span>
    </xd-card-template-ref-by-render>
  `),
  );

  it('renders templates', () => {
    const xdCardEl = ngMocks.find('xd-card-template-ref-by-render');

    const tplId = ngMocks.findTemplateRef(xdCardEl, 'id');
    const tplHeader = ngMocks.findTemplateRef(xdCardEl, [
      'myTpl',
      'header',
    ]);
    const tplFooter = ngMocks.findTemplateRef(xdCardEl, [
      'myTpl',
      'footer',
    ]);

    ngMocks.render(xdCardEl.componentInstance, tplId, undefined, {
      label: 'test',
    });
    expect(xdCardEl.nativeElement.innerHTML).toContain(
      'rendered-id-test',
    );

    ngMocks.render(xdCardEl.componentInstance, tplHeader, 'test');
    expect(xdCardEl.nativeElement.innerHTML).toContain(
      'rendered-header-test',
    );

    ngMocks.render(xdCardEl.componentInstance, tplFooter, 'test');
    expect(ngMocks.formatHtml(xdCardEl)).toContain(
      '<span my-tpl=""> rendered-footer-test </span>',
    );
  });

  it('renders structural directives', () => {
    const xdCardEl = ngMocks.find('xd-card-template-ref-by-render');
    const [header, footer] = ngMocks.findInstances(
      xdCardEl,
      MyTplDirective,
    );

    ngMocks.render(xdCardEl.componentInstance, header, 'test');
    expect(xdCardEl.nativeElement.innerHTML).toContain(
      'rendered-header-test',
    );

    ngMocks.render(footer, footer, 'test');
    expect(xdCardEl.nativeElement.innerHTML).toContain(
      'rendered-footer-test',
    );
  });
});
