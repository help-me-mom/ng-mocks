import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'internal-component',
  template: 'internal',
})
export class InternalComponent {}

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
