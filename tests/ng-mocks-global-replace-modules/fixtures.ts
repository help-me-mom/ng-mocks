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

@Component({
  selector: 'target',
  template: '{{ name }}',
})
export class Target2Component {
  public readonly name = 'target2';
}

@NgModule({
  declarations: [Target2Component],
  exports: [Target2Component],
})
export class Target2Module {}

@NgModule({
  exports: [Target1Module],
  imports: [Target1Module],
})
export class Target3Module {}
