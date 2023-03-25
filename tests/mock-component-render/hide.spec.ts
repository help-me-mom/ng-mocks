import { Component } from '@angular/core';

import { isMockOf, MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-mock-component-render-hide',
  template: 'target',
})
class TargetComponent {}

describe('mock-component-render:hide', () => {
  beforeEach(() => MockBuilder().mock(TargetComponent));

  it('does not fail on fake hides', () => {
    const component =
      MockRender(TargetComponent).point.componentInstance;

    if (isMockOf(component, TargetComponent, 'c')) {
      expect(() => component.__hide('fakeKey')).not.toThrow();
      expect(() =>
        component.__hide(['fakeProp'] as any),
      ).not.toThrow();
    }
  });
});
