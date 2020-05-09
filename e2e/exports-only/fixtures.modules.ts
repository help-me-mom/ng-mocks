// tslint:disable:max-classes-per-file

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { InternalComponent } from './fixtures.components';

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
  imports: [CommonModule],
})
export class InternalModule {}

@NgModule({
  exports: [InternalModule],
})
export class TargetModule {}
