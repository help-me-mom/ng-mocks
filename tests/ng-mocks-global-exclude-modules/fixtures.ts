import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'target',
  template: '{{ name }}',
})
export class Target1Component {
  public readonly name = 'target1';
}

@NgModule({
  declarations: [Target1Component],
  exports: [Target1Component],
})
export class Target1Module {}
