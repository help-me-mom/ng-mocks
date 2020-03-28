// tslint:disable:max-classes-per-file

import { Component } from '@angular/core';

@Component({
  selector: 'internal-component',
  template: 'internal',
})
export class InternalComponent {
}

@Component({
  selector: 'external-component',
  template: 'external <internal-component></internal-component>',
})
export class ExternalComponent {
}
