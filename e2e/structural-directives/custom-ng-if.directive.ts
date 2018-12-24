import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[customNgIf]'
})
export class CustomNgIfDirective {

  @Input('customNgIf') set setValue(value: any) {
    if (value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }

  protected templateRef: TemplateRef<any>;
  protected viewContainerRef: ViewContainerRef;

  constructor(
    templateRef: TemplateRef<any>,
    viewContainerRef: ViewContainerRef,
  ) {
    this.templateRef = templateRef;
    this.viewContainerRef = viewContainerRef;
  }
}
