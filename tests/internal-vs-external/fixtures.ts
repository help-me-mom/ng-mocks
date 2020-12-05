import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'internal-component',
  template: 'internal',
})
export class InternalComponent {}

@Component({
  selector: 'external-component',
  template: 'external <internal-component></internal-component>',
})
export class ExternalComponent {}

@NgModule({
  declarations: [InternalComponent, ExternalComponent],
  exports: [ExternalComponent],
  imports: [CommonModule],
})
export class TargetModule {}
