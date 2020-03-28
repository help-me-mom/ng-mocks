// tslint:disable:max-classes-per-file

import { Component } from '@angular/core';
import { ServiceChild } from './fixtures.services';

@Component({
  selector: 'internal-component',
  template: '{{ child.parent.echo() }}',
})
export class InternalComponent {
  public readonly child: ServiceChild;

  constructor(child: ServiceChild) {
    this.child = child;
  }
}
