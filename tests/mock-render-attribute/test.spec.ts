import {
  Attribute,
  Component,
  Directive,
  NgModule,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[test]',
})
class TargetDirective {
  constructor(@Attribute('test') public readonly test: string) {}
}

@Component({
  selector: 'target-mock-render-attribute',
  template: `{{ test }}`,
})
class TargetComponent extends TargetDirective {
  constructor(@Attribute('test') public readonly test: string) {
    super(test);
  }
}

@NgModule({
  declarations: [TargetDirective, TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/discussions/2548
describe('mock-render-attribute', () => {
  beforeEach(() =>
    MockBuilder([TargetComponent, TargetDirective, TargetModule]),
  );

  it('sets attributes correctly', () => {
    MockRender<TargetComponent>(
      '<target-mock-render-attribute test="123"></target-mock-render-attribute>',
    );

    const component = ngMocks.findInstance(TargetComponent);
    expect(component.test).toEqual('123');

    const directive = ngMocks.findInstance(TargetDirective);
    expect(directive.test).toEqual('123');
  });
});
