import { Component, Directive, NgModule } from '@angular/core';

import { TargetPipe } from './2.fixtures';

@Component({
  selector: 'target',
  template: '{{ name }}',
})
export class TargetComponent {
  public readonly name = 'target';
}

@Directive({
  selector: 'target',
})
export class TargetDirective {
  public readonly name = 'target';
}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
  exports: [TargetComponent, TargetDirective, TargetPipe],
})
export class TargetModule {}
