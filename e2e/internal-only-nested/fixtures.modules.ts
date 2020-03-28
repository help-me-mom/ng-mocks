// tslint:disable:max-classes-per-file

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { InternalComponent } from './fixtures.components';

@NgModule({
  declarations: [
    InternalComponent,
  ],
  imports: [
    CommonModule,
  ],
})
export class Nested1Module {}

@NgModule({
  imports: [
    Nested1Module,
  ],
})
export class Nested2Module {}

@NgModule({
  imports: [
    Nested1Module,
  ],
})
export class Nested3Module {}

@NgModule({
  imports: [
    Nested2Module,
    Nested3Module,
  ],
})
export class TargetModule {}
