// tslint:disable:max-classes-per-file

import { NgModule } from '@angular/core';

import { InternalComponent } from './fixtures.components';
import { ServiceChild, ServiceParent, ServiceReplacedParent } from './fixtures.services';

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
  providers: [
    ServiceParent,
    ServiceReplacedParent,
    {
      deps: [ServiceReplacedParent],
      provide: ServiceChild,
      useFactory: (parent: ServiceParent) => new ServiceChild(parent),
    },
  ],
})
export class TargetModule {}
