import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'internal-component',
  template: 'internal',
})
export class InternalComponent {}

@NgModule({
  declarations: [InternalComponent],
  exports: [InternalComponent],
})
export class TargetModule {}
