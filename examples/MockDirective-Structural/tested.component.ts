import { Component } from '@angular/core';

@Component({
  selector: 'tested',
  template: `
    <span *dependency="value" (dependency-output)="trigger($event)">content</span>
  `,
})
export class TestedComponent {
  value = '';
  trigger = () => {};
}
