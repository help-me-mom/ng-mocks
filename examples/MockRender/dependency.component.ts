import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

@Component({
  selector: 'dependency-component-selector',
  template: `dependency`,
})
export class DependencyComponent {
  @ContentChild('something')
  injectedSomething: TemplateRef<{}>;

  @Input()
  someInput = '';

  @Output()
  someOutput = new EventEmitter();
}
