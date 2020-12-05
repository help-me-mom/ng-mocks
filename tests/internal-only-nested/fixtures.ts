import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'internal-component',
  template: 'internal',
})
export class InternalComponent {}

@NgModule({
  declarations: [InternalComponent],
  imports: [CommonModule],
})
export class Nested1Module {}

@NgModule({
  imports: [Nested1Module],
})
export class Nested2Module {}

@NgModule({
  imports: [Nested1Module],
})
export class Nested3Module {}

@NgModule({
  imports: [Nested2Module, Nested3Module],
})
export class TargetModule {}
