import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'tested',
  template: ` <dependency-component-selector [formControl]="formControl"></dependency-component-selector> `,
})
export class TestedComponent {
  formControl = new FormControl();
}
