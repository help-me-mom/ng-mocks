import { Component } from '@angular/core';

import { MockComponent } from 'ng-mocks';

@Component({
  selector: 'target-3274',
  template: '',
})
class TargetComponent {}

Object.defineProperty(TargetComponent, 'name', {
  value: '',
});

// @see https://github.com/help-me-mom/ng-mocks/issues/3274
// funcGetName should return a compatible string with a function name.
// Before it was arrow-function which caused issues because of the dash char.
// Now it is arrowFunction and is compatible.
describe('issue-3274', () => {
  it('creates correct mock name', () => {
    const mock = MockComponent(TargetComponent);
    expect(mock.name).toEqual('MockOfarrowFunction');
  });
});
