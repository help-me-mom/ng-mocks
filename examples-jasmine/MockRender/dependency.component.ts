import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef } from '@angular/core';

import { staticFalse } from '../../tests-jasmine';

@Component({
  selector: 'dependency-component-selector',
  template: `dependency`,
})
export class DependencyComponent {
  @ContentChild('something', { ...staticFalse })
  injectedSomething: TemplateRef<{}>;

  @Input()
  someInput = '';

  @Output()
  someOutput = new EventEmitter();
}
