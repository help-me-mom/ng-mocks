import {
  Component,
  Directive,
  Input,
  NgModule,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockDirective,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: '[show]',
})
export class ShowDirective {
  public constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainerRef: ViewContainerRef,
  ) {}

  @Input('show') public set setValue(value: any) {
    if (value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}

@Directive({
  selector: '[hide]',
})
export class HideDirective {
  public constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainerRef: ViewContainerRef,
  ) {}

  @Input('hide') public set setValue(value: any) {
    if (value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}

@Component({
  selector: 'target-971',
  template: `
    <ng-container *show="flag">:show:{{ content }}:</ng-container>
    <ng-container *hide="flag">:hide:{{ content }}:</ng-container>
  `,
})
export class TargetComponent {
  @Input() public readonly content: string | null = null;
  @Input() public readonly flag: boolean | null = null;
}

@NgModule({
  declarations: [TargetComponent, ShowDirective, HideDirective],
})
class TargetModule {}

// sets config
ngMocks.defaultConfig(ShowDirective, {
  render: true,
});

// removes config
ngMocks.defaultConfig(HideDirective, {
  render: true,
});
ngMocks.defaultConfig(HideDirective);

// @see https://github.com/help-me-mom/ng-mocks/issues/971#issuecomment-902467724
describe('issue-971:MockBuilder', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders structural directives', () => {
    const fixture = MockRender(TargetComponent, {
      content: 'target',
    });

    expect(ngMocks.formatText(fixture)).toEqual(':show:target:');
  });
});

describe('issue-971:TestBed', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      declarations: [
        TargetComponent,
        MockDirective(ShowDirective),
        MockDirective(HideDirective),
      ],
    }),
  );

  it('renders structural directives', () => {
    const fixture = MockRender(TargetComponent, {
      content: 'target',
    });

    expect(ngMocks.formatText(fixture)).toEqual(':show:target:');
  });
});
