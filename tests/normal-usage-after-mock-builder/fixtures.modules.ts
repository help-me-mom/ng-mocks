import { NgModule } from '@angular/core';

import { RealComponent, TargetComponent } from './fixtures.components';
import { TargetService } from './fixtures.services';

@NgModule({
  declarations: [TargetComponent, RealComponent],
  exports: [TargetComponent],
  providers: [TargetService],
})
export class TargetModule {
  protected service: TargetService;

  public constructor(service: TargetService) {
    this.service = service;
    this.service.call();
  }
}
