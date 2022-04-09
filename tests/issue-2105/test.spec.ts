import { Component, Input, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target',
  template: ' {{ value }} ',
})
class TargetComponent {
  @Input() public readonly value: string | null = null;
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/ike18t/ng-mocks/issues/2105
describe('issue-2105', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('finds all instances', () => {
    const fixture = MockRender(`
      <div class="root">
        <target value="1"></target>
        <target value="2"></target>
        <div class="child child1">
          <target value="3"></target>
          <target value="4"></target>
        </div>
        <div class="child child2">
          <target value="5"></target>
          <target value="6"></target>
          <div class="child child3">
            <target value="7"></target>
            <target value="8"></target>
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
