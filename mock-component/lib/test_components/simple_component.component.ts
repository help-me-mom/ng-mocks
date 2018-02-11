import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  exportAs: 'seeimple',
  selector: 'simple-component',
  template: 'some template'
})
export class SimpleComponent {
  @Input() someInput: string;
  @Input('someOtherInput') someInput2: string;
  @Output() someOutput1: EventEmitter<string>;
  @Output() someOutput2: EventEmitter<string>;
}
