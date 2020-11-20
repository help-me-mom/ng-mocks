import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'base-simple-component',
  template: 'some template',
})
export class BaseSimpleComponent {
  @Output() public readonly someOutput2: EventEmitter<string>;
}

@Component({
  exportAs: 'seeimple',
  selector: 'simple-component',
  template: 'some template',
})
export class SimpleComponent extends BaseSimpleComponent {
  @Input() public someInput: string;
  @Input('someOtherInput') public someInput2: string;
  @HostBinding('class.someClass') @Input() public someInput3: boolean;
  @Output() public readonly someOutput1: EventEmitter<string>;
}
