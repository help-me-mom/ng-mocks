import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[customNgIf]',
})
export class CustomNgIfDirective {
  protected templateRef: TemplateRef<any>;
  protected viewContainerRef: ViewContainerRef;

  public constructor(templateRef: TemplateRef<any>, viewContainerRef: ViewContainerRef) {
    this.templateRef = templateRef;
    this.viewContainerRef = viewContainerRef;
  }
  @Input('customNgIf') public set setValue(value: any) {
    if (value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
