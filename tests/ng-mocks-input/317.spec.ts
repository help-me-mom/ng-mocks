import { Component, Input } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  template: '{{ prop }}',
})
class TargetComponent {
  @Input() public readonly prop = null;
}

describe('ng-mocks-input:317', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('finds by css selector', () => {
    MockRender(
      '<div data-label="div">1</div><target data-target="target" [prop]="5"></target>',
    );

    expect(ngMocks.input('target', 'prop')).toEqual(5);
    expect(ngMocks.input(['data-target'], 'prop')).toEqual(5);
    expect(ngMocks.input(['data-target', 'target'], 'prop')).toEqual(
      5,
    );
  });
});
