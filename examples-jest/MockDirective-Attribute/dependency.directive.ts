import { Directive, EventEmitter, Input, Output } from '@angular/core';

@Directive({
  selector: '[dependency]',
})
export class DependencyDirective {
  @Input('dependency-input')
  someInput = '';

  @Output('dependency-output')
  someOutput = new EventEmitter();
}
