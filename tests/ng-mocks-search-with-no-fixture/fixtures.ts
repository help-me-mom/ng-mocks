import { Component, Input, NgModule } from '@angular/core';

@Component({
  selector: 'target-ng-mocks-search-with-no-fixture',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ target }}',
})
export class TargetComponent {
  @Input() public readonly target = '';
}

@Component({
  selector: 'missed',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'missed',
})
export class MissedComponent {}

@Component({
  selector: 'test',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template:
    '<target-ng-mocks-search-with-no-fixture target="1"></target-ng-mocks-search-with-no-fixture><target-ng-mocks-search-with-no-fixture target="2"></target-ng-mocks-search-with-no-fixture>',
})
export class TestComponent {}

@NgModule({
  declarations: [TargetComponent, MissedComponent, TestComponent],
})
export class TargetModule {}
