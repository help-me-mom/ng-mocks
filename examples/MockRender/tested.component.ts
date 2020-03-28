import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'tested',
  template: `
    <dependency-component-selector [someInput]="value" (someOutput)="trigger($event)"></dependency-component-selector>
  `
})
export class TestedComponent {
  @Output()
  trigger = new EventEmitter();

  @Input()
  value1 = '';

  @Input()
  value2 = '';
}
