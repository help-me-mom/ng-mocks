import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'simple-component',
  template: 'some template'
})
export class SimpleComponent {
  @Input() someInput: string;
  @Output() someOutput1: EventEmitter<string>;
  @Output() someOutput2: EventEmitter<string>;
}
