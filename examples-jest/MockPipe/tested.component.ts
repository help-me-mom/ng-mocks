import { Component } from '@angular/core';

@Component({
  selector: 'tested',
  template: ` <span>{{ 'foo' | dependency }}</span> `,
})
export class TestedComponent {}
