import { Component } from '@angular/core';

@Component({
  selector: 'tested',
  template: `
    <dependency-component-selector [someInput]="value" (someOutput)="trigger($event)"></dependency-component-selector>
  `,
})
export class TestedComponent {
  value = '';
  trigger = (obj: any) => {};
}
