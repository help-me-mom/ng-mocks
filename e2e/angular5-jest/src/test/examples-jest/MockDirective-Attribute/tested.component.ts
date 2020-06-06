import { Component } from '@angular/core';

@Component({
  selector: 'tested',
  template: ` <span dependency [dependency-input]="value" (dependency-output)="trigger($event)"></span> `,
})
export class TestedComponent {
  value = '';
  trigger = () => {};
}
