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
export class TargetModule {}
