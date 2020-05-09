// tslint:disable:max-classes-per-file

import { NgModule } from '@angular/core';

import { InternalComponent } from './fixtures.components';

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
})
export class TargetModule {}
