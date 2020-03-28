import { Component } from '@angular/core';

@Component({
  selector: 'child-component',
  template: 'some template',
})
export class ChildComponent {
  performAction(s: string) {
    return this;
  }
}
