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

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[tpl1]',
})
class Mock1Directive {
  @Input('tpl1') public readonly name: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  selector: '[tpl2]',
})
class Mock2Directive {
  @Input('tpl2') public readonly name: string | null = null;

  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Directive({
  selector: '[tpl3]',
})
class Mock3Directive {
  @Input('tpl3') public readonly name: string | null = null;

  @ContentChild('info', {} as any)
  public readonly tpl?: TemplateRef<any>;
}

@Component({
  selector: 'mock-ng-mocks-render-component',
  template: `
    <div data-role="header" *ngIf="header">
      <ng-container *ngTemplateOutlet="header"></ng-container>
    </div>
    <div data-role="info" *ngIf="info">
      <ng-container
        *ngTemplateOutlet="
          info.tpl;
          context: { $implicit: info.name }
        "
      ></ng-container>
    </div>
    <div data-role="templates" *ngIf="templates">
      <ng-container *ngFor="let template of templates">
        <ng-container
          *ngTemplateOutlet="
            template;
            context: { $implicit: 'template' }
          "
        ></ng-container>
      </ng-container>
    </div>
    <div data-role="directives" *ngIf="directives">
      <ng-container *ngFor="let directive of directives">
        <ng-container
          *ngTemplateOutlet="
            directive.tpl;
            context: { $implicit: directive.name }
          "
        ></ng-container>
      </ng-container>
    </div>
  `,
})
class MockComponent {
  @ContentChildren(Mock2Directive, {} as any)
  public readonly directives?: QueryList<Mock2Directive>;

  @ContentChild('header', {} as any)
  public readonly header?: TemplateRef<any>;

  @ContentChild(Mock3Directive, {} as any)
  public readonly info?: Mock3Directive;

  @ContentChildren(Mock1Directive, {
    read: TemplateRef,
  } as any)
  public readonly templates?: QueryList<TemplateRef<any>>;
}

@Component({
  selector: 'target-ng-mocks-render-component',
  template: `
    <mock-ng-mocks-render-component>
      :step:1:
      <ng-template #header>rendered-header</ng-template>
      :step:2:
      <ng-template tpl1="tpl1" let-param
        >rendered-tpl1-1-{{ param }}</ng-template
      >
      :step:3:
      <div *tpl1="'tpl2'; let param">rendered-tpl1-2-{{ param }}</div>
      :step:4:
      <ng-template tpl2="tpl1" let-param
        >rendered-tpl2-1-{{ param }}</ng-template
      >
      :step:5:
      <div *tpl2="'tpl2'; let param">rendered-tpl2-2-{{ param }}</div>
      :step:6:
      <div tpl3="info">
        :step:7:
        <ng-template #info let-param
          >rendered-info-{{ param }}</ng-template
        >
        :step:8:
      </div>
      :step:9:
    </mock-ng-mocks-render-component>
  `,
})
class TargetComponent {}

@NgModule({
  declarations: [
    Mock1Directive,
    Mock2Directive,
    Mock3Directive,
    MockComponent,
    TargetComponent,
  ],
  imports: [CommonModule],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('ng-mocks-render:component:real', () => {
  beforeEach(() => MockBuilder(TargetComponent).keep(TargetModule));

  it('renders templates properly', () => {
    const fixture = MockRender(TargetComponent);
    const html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).not.toContain(':step:');
    expect(html).toContain('rendered-header');
    expect(html).toContain('rendered-info-info');
    expect(html).toContain('rendered-tpl1-1-template');
    expect(html).toContain('rendered-tpl1-2-template');
    expect(html).toContain('rendered-tpl2-1-tpl1');
    expect(html).toContain('rendered-tpl2-2-tpl2');
  });
});

describe('ng-mocks-render:component:mock', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders directives on their positions', () => {
    let html = '';
    const fixture = MockRender(TargetComponent);

    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:2: :step:3: :step:4:');
    for (const directive of ngMocks.findInstances(Mock1Directive)) {
      if (isMockOf(directive, Mock1Directive, 'd')) {
        directive.__render('mock');
      }
    }
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(
      ':step:2: rendered-tpl1-1-mock :step:3: <div>rendered-tpl1-2-mock</div> :step:4:',
    );
  });

  it('renders queries of components in the end', () => {
    let html = '';
    const fixture = MockRender(TargetComponent);

    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: :step:2:');
    const component = ngMocks.findInstance(MockComponent);
    if (isMockOf(component, MockComponent, 'c')) {
      component.__render('header');
      component.__render(['templates'], ':templates:');
    }
    html = ngMocks.formatHtml(fixture.nativeElement);

    // component renders own queries in the end of own template.
    expect(html).toContain(':step:1: :step:2:');
    expect(html).toContain(
      ':step:9: ' +
        '<div data-key="header">rendered-header</div>' +
        '<div data-prop="templates">' +
        'rendered-tpl1-1-:templates:' +
        '<div>rendered-tpl1-2-:templates:</div>' +
        '</div>',
    );
  });

  it('renders all desired templates', () => {
    let html = '';
    const fixture = MockRender(TargetComponent);

    const tplHeader = ngMocks.findTemplateRef('header');
    const tpl1tpl1 = ngMocks.findTemplateRef(['tpl1', 'tpl1']);
    const tpl1tpl2 = ngMocks.findTemplateRef(['tpl1', 'tpl2']);
    const tpl2tpl1 = ngMocks.findTemplateRef(['tpl2', 'tpl1']);
    const tpl2tpl2 = ngMocks.findTemplateRef(['tpl2', 'tpl2']);
    const tpl3 = ngMocks.findTemplateRef('info');
    expect(tplHeader).toEqual(assertion.any(TemplateRef));
    expect(tpl1tpl1).toEqual(assertion.any(TemplateRef));
    expect(tpl1tpl2).toEqual(assertion.any(TemplateRef));
    expect(tpl2tpl1).toEqual(assertion.any(TemplateRef));
    expect(tpl2tpl2).toEqual(assertion.any(TemplateRef));
    expect(tpl3).toEqual(assertion.any(TemplateRef));

    // our render entrypoint component
    const component = ngMocks.findInstance(MockComponent);

    // render tplHeader
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: :step:2:');
    ngMocks.render(component, tplHeader);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: rendered-header :step:2:');

    // render tpl1tpl1
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:2: :step:3:');
    ngMocks.render(component, tpl1tpl1, 'tpl1tpl1');
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(
      ':step:2: rendered-tpl1-1-tpl1tpl1 :step:3:',
    );

    // render tpl1tpl2
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: :step:4:');
    ngMocks.render(component, tpl1tpl2, 'tpl1tpl2');
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(
      ':step:3: <div>rendered-tpl1-2-tpl1tpl2</div> :step:4:',
    );

    // render tpl2tpl1
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:4: :step:5:');
    ngMocks.render(component, tpl2tpl1, 'tpl2tpl1');
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(
      ':step:4: rendered-tpl2-1-tpl2tpl1 :step:5:',
    );

    // render tpl2tpl2
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:5: :step:6:');
    ngMocks.render(component, tpl2tpl2, 'tpl2tpl2');
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(
      ':step:5: <div>rendered-tpl2-2-tpl2tpl2</div> :step:6:',
    );

    // render tpl3
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:7: :step:8:');
    ngMocks.render(component, tpl3, 'tpl3');
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:7: rendered-info-tpl3 :step:8:');

    // update tpl1tpl1 as directive
    const tpl1tpl1dir = ngMocks.findInstance(Mock1Directive);
    ngMocks.render(tpl1tpl1dir, tpl1tpl1dir, 'tpl1tpl1dir');
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(
      ':step:2: rendered-tpl1-1-tpl1tpl1dir :step:3:',
    );

    // update tpl3
    ngMocks.render(component, tpl3, 'tpl3-updated');
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(
      ':step:7: rendered-info-tpl3-updated :step:8:',
    );

    // hide tplHeader
    expect(html).not.toContain(':step:1: :step:2:');
    ngMocks.hide(component, tplHeader);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:1: :step:2:');

    // hide tpl1tpl1
    expect(html).not.toContain(':step:2: :step:3:');
    ngMocks.hide(component, tpl1tpl1);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:2: :step:3:');

    // hide tpl1tpl2
    const [, tpl1tpl2dir] = ngMocks.findInstances(Mock1Directive);
    expect(html).not.toContain(':step:3: :step:4:');
    ngMocks.hide(tpl1tpl2dir);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:3: :step:4:');

    // hide tpl2tpl1
    const [tpl2tpl1dir] = ngMocks.findInstances(Mock2Directive);
    expect(html).not.toContain(':step:4: :step:5:');
    ngMocks.hide(tpl2tpl1dir);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:4: :step:5:');

    // hide tpl2tpl2
    expect(html).not.toContain(':step:5: :step:6:');
    ngMocks.hide(
      component,
      ngMocks.findTemplateRef(['tpl2', 'tpl2']),
    );
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:5: :step:6:');

    // hide tpl3
    expect(html).not.toContain(':step:7: :step:8:');
    ngMocks.hide(component, tpl3);
    html = ngMocks.formatHtml(fixture.nativeElement);
    expect(html).toContain(':step:7: :step:8:');
  });

  it('throws if not a mock instance has been passed', () => {
    MockRender(TargetComponent);

    const tpl = ngMocks.findTemplateRef('header');
    expect(() => ngMocks.render({}, tpl)).toThrowError(
      'Only instances of mock declarations are accepted',
    );
  });

  it('throws if TemplateRef cannot be found on render request', () => {
    MockRender(TargetComponent);

    const directive = ngMocks.findInstance(Mock3Directive);
    const tpl = ngMocks.findTemplateRef('header');
    expect(() => ngMocks.render(directive, tpl)).toThrowError(
      'Cannot find path to the TemplateRef',
    );
  });

  it('throws if no template has been passed on render request', () => {
    MockRender(TargetComponent);

    const directive = ngMocks.findInstance(Mock3Directive);
    expect(() =>
      ngMocks.render(directive, undefined as any),
    ).toThrowError(
      'Unknown template has been passed, only TemplateRef or a mock structural directive are supported',
    );
  });

  it('throws if TemplateRef cannot be found on hide request', () => {
    MockRender(TargetComponent);

    const directive = ngMocks.findInstance(Mock3Directive);
    const tpl = ngMocks.findTemplateRef('header');
    expect(() => ngMocks.hide(directive, tpl)).toThrowError(
      'Cannot find path to the TemplateRef',
    );
  });
});
