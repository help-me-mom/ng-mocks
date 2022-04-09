import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  Directive,
  Input,
  NgModule,
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
  providers: [
    {
      provide: TplDirective,
      useExisting: MockDirective,
    },
  ],
  selector: '[mock]',
})
class MockDirective {
  public constructor(public readonly tpl: TemplateRef<any>) {}
}

@Component({
  selector: 'target',
  template: `<component
    ><ng-template mock>rendered-mock</ng-template></component
  >`,
})
class TargetComponent {}

@Component({
  selector: 'component',
  template: '',
})
class MockComponent {
  @ContentChild(TplDirective, {} as any)
  public readonly directive?: TplDirective;
}

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

describe('ng-mocks-render:debug-node', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders and hides debugNode', () => {
    const fixture = MockRender(TargetComponent);
    const component = ngMocks.findInstance(MockComponent);
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<target><component></component></target>',
    );

    const mockEl = ngMocks.reveal(['mock']);
    ngMocks.render(component, mockEl);
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<target><component>rendered-mock</component></target>',
    );

    ngMocks.hide(component, mockEl);
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<target><component></component></target>',
    );

    expect(() =>
      ngMocks.render(component, fixture.debugElement),
    ).toThrowError(
      'Unknown template has been passed, only TemplateRef or a mock structural directive are supported',
    );
    expect(() =>
      ngMocks.hide(component, fixture.debugElement),
    ).toThrowError(
      'Unknown template has been passed, only TemplateRef or a mock structural directive are supported',
    );
  });
});
