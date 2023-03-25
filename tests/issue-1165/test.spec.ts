import { Component } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-1165',
  template: '{{ value }}',
})
class TargetComponent {
  private valueOrigin = 0;

  public get value(): number {
    return this.valueOrigin;
  }

  public set value(value: number) {
    this.valueOrigin = value;
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/1165
describe('issue-1165', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('sets values via proxy', () => {
    const fixture = MockRender(TargetComponent);
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.componentInstance.value = 1;
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('1');

    fixture.point.componentInstance.value = 2;
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('2');

    ngMocks.stubMember(fixture.componentInstance, 'value', 3);
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('3');

    ngMocks.stubMember(fixture.point.componentInstance, 'value', 4);
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('4');
  });
});
