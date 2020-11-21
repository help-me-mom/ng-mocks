import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[type]',
})
export class CustomTypeDirective {
  @Input('type') public type = '';

  public constructor(public template: TemplateRef<any>) {}
}
