import { Component } from '@angular/core';

import { MockComponent } from 'ng-mocks';

@Component({
  selector: 'target-mock-component',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'target',
})
class TargetComponent {}

describe('MockComponent', () => {
  it('reuses mocks', () => {
    const expected = MockComponent(TargetComponent);
    const actual = MockComponent(TargetComponent);
    expect(actual).toBe(expected);
  });
});
