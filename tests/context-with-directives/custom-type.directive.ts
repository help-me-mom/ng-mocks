import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[type]',
})
export class CustomTypeDirective {
  public template: TemplateRef<any>;
  @Input('type') public type: string;

  public constructor(template: TemplateRef<any>) {
    this.template = template;
  }
}
