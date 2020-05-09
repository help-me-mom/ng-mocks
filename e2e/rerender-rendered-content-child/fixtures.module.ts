// tslint:disable:max-classes-per-file

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { ContentChildComponent } from './fixtures.components';

@NgModule({
  declarations: [ContentChildComponent],
  exports: [ContentChildComponent],
  imports: [CommonModule],
})
export class ContentChildModule {}
