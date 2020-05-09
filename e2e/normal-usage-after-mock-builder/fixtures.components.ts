// tslint:disable:max-classes-per-file

import { Component } from '@angular/core';
import { TargetService } from './fixtures.services';

@Component({
  selector: 'root',
  template: '<internal></internal>{{ service.called }}',
})
export class TargetComponent {
  public readonly service: TargetService;

  constructor(service: TargetService) {
    this.service = service;
  }
}

@Component({
  selector: 'internal',
  template: 'real',
})
export class RealComponent {
}

@Component({
  selector: 'internal',
  template: 'fake',
})
export class FakeComponent {
}
