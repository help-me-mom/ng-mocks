import { Component } from '@angular/core';

@Component({
  selector: 'child-component',
  template: 'some template',
})
export class ChildComponent {
  public performAction(s: string) {
    return s ? this : this;
  }
}
