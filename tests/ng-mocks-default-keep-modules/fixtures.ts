import { Component, NgModule } from '@angular/core';

@Component({
  selector: 'target1',
  template: '{{ name }}',
})
export class Target1Component {
  public readonly name = 'target1';
}

@Component({
  selector: 'target1',
  template: '{{ name }}',
})
export class Fake1Component {
  public readonly name = 'fake1';
}

@NgModule({
  declarations: [Target1Component],
  exports: [Target1Component],
})
export class Target1Module {}

@Component({
  selector: 'target2',
  template: '{{ name }}',
})
export class Target2Component {
  public readonly name = 'target2';
}

@Component({
  selector: 'normal2',
  template: '{{ name }}',
})
export class Normal2Component {
  public readonly name = 'normal2';
}

@NgModule({
  declarations: [Target2Component, Normal2Component],
  exports: [Target2Component, Normal2Component],
  imports: [Target1Module],
})
export class Target2Module {}

@NgModule({
  exports: [Target1Component, Target2Component, Normal2Component],
  imports: [Target1Module, Target2Module],
})
export class Target3Module {}
