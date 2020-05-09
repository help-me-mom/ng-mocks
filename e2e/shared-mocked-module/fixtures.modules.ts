// tslint:disable:max-classes-per-file

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { Child1Component, Child2Component, MyComponent, TargetComponent } from './fixtures.components';

@NgModule({
  declarations: [MyComponent],
  exports: [MyComponent],
})
export class MyModule {}

@NgModule({
  declarations: [Child1Component],
  exports: [Child1Component],
  imports: [MyModule],
})
export class Child1Module {}

@NgModule({
  declarations: [Child2Component],
  exports: [Child2Component],
  imports: [MyModule],
})
export class Child2Module {}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  imports: [CommonModule, Child1Module, Child2Module],
})
export class TargetModule {}
