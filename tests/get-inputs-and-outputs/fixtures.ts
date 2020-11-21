import { Component, Directive, EventEmitter, Input, NgModule, Output } from '@angular/core';

@Component({
  selector: 'target',
  template: '<a (click)="output.emit()">{{ input }}</a>',
})
export class TargetComponent {
  @Input('input1') public input = '';
  @Output('output1') public output = new EventEmitter();
}

@Directive({
  selector: 'target',
})
export class Target2Directive {
  @Input('input2') public input = '';
  @Input('inputUnused') public input2: undefined;
  @Output('output2') public output = new EventEmitter();
}

@Directive({
  selector: 'target',
})
export class Target3Directive {
  @Input('input3') public input = '';
  @Output('output3') public output = new EventEmitter();
}

@NgModule({
  declarations: [TargetComponent, Target2Directive, Target3Directive],
  exports: [TargetComponent, Target2Directive, Target3Directive],
})
export class TargetModule {}
