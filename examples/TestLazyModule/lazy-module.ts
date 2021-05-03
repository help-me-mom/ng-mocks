import { Component, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'lazy',
  template: 'lazy-component',
})
export class LazyComponent {}

@NgModule({
  exports: [RouterModule],
  imports: [
    RouterModule.forChild([
      {
        component: LazyComponent,
        path: '',
      },
    ]),
  ],
})
class LazyModuleRouting {}

@NgModule({
  declarations: [LazyComponent],
  imports: [LazyModuleRouting],
})
export class LazyModule {}
