import { Component, Directive, EventEmitter, Input, NgModule, Output } from '@angular/core';

@Component({
  selector: 'target',
  template: '<a (click)="output.emit()">{{ input }}</a>',
})
export class TargetComponent {
  @Input('input1') input: string;
  @Output('output1') output = new EventEmitter();
}

@Directive({
  selector: 'target',
})
export class Target2Directive {
  @Input('input2') input: string;
  @Input('inputUnused') input2: undefined;
  @Output('output2') output = new EventEmitter();
}

@Directive({
  selector: 'target',
})
export class Target3Directive {
  @Input('input3') input: string;
  @Output('output3') output = new EventEmitter();
}

@NgModule({
  declarations: [TargetComponent, Target2Directive, Target3Directive],
  exports: [TargetComponent, Target2Directive, Target3Directive],
})
export class TargetModule {}
