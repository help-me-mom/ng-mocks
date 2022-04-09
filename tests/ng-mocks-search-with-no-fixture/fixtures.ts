import { Component, Input, NgModule } from '@angular/core';

@Component({
  selector: 'target',
  template: '{{ target }}',
})
export class TargetComponent {
  @Input() public readonly target = '';
}

@Component({
  selector: 'missed',
  template: 'missed',
})
export class MissedComponent {}

@Component({
  selector: 'test',
  template: '<target target="1"></target><target target="2"></target>',
})
export class TestComponent {}

@NgModule({
  declarations: [TargetComponent, MissedComponent, TestComponent],
})
export class TargetModule {}
