import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ExternalComponent, InternalComponent } from './fixtures.components';

@NgModule({
  declarations: [InternalComponent, ExternalComponent],
  exports: [ExternalComponent],
  imports: [CommonModule],
})
export class TargetModule {}
