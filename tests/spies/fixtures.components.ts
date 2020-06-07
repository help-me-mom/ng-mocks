import { Component } from '@angular/core';

import { TargetService } from './fixtures.providers';

@Component({
  selector: 'target',
  template: '<ng-content></ng-content>',
})
export class TargetComponent {
  protected service: TargetService;

  constructor(service: TargetService) {
    this.service = service;
    this.service.echo('constructor');
  }

  public echo(): string {
    return this.service.echo('TargetComponent');
  }
}
