import { Component, Input, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-2105',
  template: ' {{ value }} ',
})
class TargetComponent {
  @Input() public readonly value: string | null = null;
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/2105
describe('issue-2105', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('finds all instances', () => {
    const fixture = MockRender(`
      <div class="root">
        <target-2105 value="1"></target-2105>
        <target-2105 value="2"></target-2105>
        <div class="child child1">
          <target-2105 value="3"></target-2105>
          <target-2105 value="4"></target-2105>
        </div>
        <div class="child child2">
          <target-2105 value="5"></target-2105>
          <target-2105 value="6"></target-2105>
          <div class="child child3">
            <target-2105 value="7"></target-2105>
            <target-2105 value="8"></target-2105>
          </div>
        </div>
      </div>
    `);

    expect(ngMocks.formatText(fixture)).toEqual('1 2 3 4 5 6 7 8');

    // looking for all
    {
      const instances = ngMocks.findInstances('div', TargetComponent);
      expect(instances.length).toEqual(8);
    }

    // looking for children only
    // it should collect data from child1, child2 and child3.
    {
      const instances = ngMocks.findInstances(
        'div.child',
        TargetComponent,
      );
      expect(instances.length).toEqual(6);
    }
  });
});
