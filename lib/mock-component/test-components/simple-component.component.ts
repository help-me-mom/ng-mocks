import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'base-simple-component',
  template: 'some template',
})
export class BaseSimpleComponent {
  @Output() someOutput2: EventEmitter<string>;
}

/* tslint:disable:max-classes-per-file */
@Component({
  exportAs: 'seeimple',
  selector: 'simple-component',
  template: 'some template',
})
export class SimpleComponent extends BaseSimpleComponent {
  @Input() someInput: string;
  @Input('someOtherInput') someInput2: string;
  @HostBinding('class.someClass') @Input() someInput3: boolean;
  @Output() someOutput1: EventEmitter<string>;
}
/* tslint:enable:max-classes-per-file */
