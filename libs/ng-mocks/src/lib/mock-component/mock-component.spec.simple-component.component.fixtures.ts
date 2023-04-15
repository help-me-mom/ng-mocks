import { Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';

@Component({
  selector: 'base-simple-component',
  template: 'some template',
})
export class BaseSimpleComponent {
  @Output() public readonly someOutput2 = new EventEmitter<string>();
}

@Component({
  exportAs: 'simple',
  selector: 'simple-component',
  template: 'some template',
})
export class SimpleComponent extends BaseSimpleComponent {
  @Input() public someInput = '';
  @Input('someOtherInput') public someInput2 = '';
  @HostBinding('class.someClass') @Input() public someInput3 = false;
  @Output() public readonly someOutput1 = new EventEmitter<string>();
}
