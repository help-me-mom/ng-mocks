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
  template: `
    <component>
      <ng-template mock>rendered-mock</ng-template>
    </component>
  `,
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

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

describe('ng-mocks-render:use-existing', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('substitutes in mocks correctly', () => {
    MockRender(TargetComponent);
    const component = ngMocks.findInstance(MockComponent);
    expect(component.directive).toEqual(assertion.any(MockDirective));
  });
});
