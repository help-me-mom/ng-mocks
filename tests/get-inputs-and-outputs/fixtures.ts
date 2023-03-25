import { Component, Directive, EventEmitter, InjectionToken, Input, NgModule, Output } from '@angular/core';

const TARGET = new InjectionToken('TARGET');

@Component({
  providers: [
    {
      provide: TARGET,
      useValue: 'test',
    },
  ],
  selector: 'target-get-inputs-and-outputs',
  template: '<a (click)="output.emit()">{{ input }}</a>',
})
export class TargetComponent {
  @Input('input1') public input = '';
  @Output('output1') public output = new EventEmitter();
}

@Directive({
  providers: [
    {
      provide: TARGET,
      useValue: 'test',
    },
  ],
  selector: 'target-get-inputs-and-outputs',
})
export class Target2Directive {
  @Input('input2') public input = '';
  @Input('inputUnused') public input2: undefined;
  @Output('output2') public output = new EventEmitter();
}

@Directive({
  providers: [
    {
      provide: TARGET,
      useValue: 'test',
    },
  ],
  selector: 'target-get-inputs-and-outputs',
})
export class Target3Directive {
  @Input('input3') public input = '';
  @Output('output3') public output = new EventEmitter();
}

@NgModule({
  declarations: [TargetComponent, Target2Directive, Target3Directive],
  exports: [TargetComponent, Target2Directive, Target3Directive],
  providers: [
    {
      provide: TARGET,
      useValue: 'test',
    },
  ],
})
export class TargetModule {}
