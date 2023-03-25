import { Component, ContentChild, TemplateRef } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-567',
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  @ContentChild('s-e_-_ri23sTo 12 o#ltTem_~_plate_', {} as any)
  public readonly seriesTooltipTemplate?: TemplateRef<any>;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/567
describe('issue-567', () => {
  beforeEach(() => MockBuilder(null, TargetComponent));

  it('does not fail on seriesTooltipTemplate', () => {
    expect(() => MockRender(TargetComponent)).not.toThrow();
  });
});
