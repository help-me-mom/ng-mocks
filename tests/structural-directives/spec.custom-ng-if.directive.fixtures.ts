import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[customNgIf]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
export class CustomNgIfDirective {
  public constructor(
    protected templateRef: TemplateRef<any>,
    protected viewContainerRef: ViewContainerRef,
  ) {}

  @Input('customNgIf') public set setValue(value: any) {
    if (value) {
      this.viewContainerRef.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainerRef.clear();
    }
  }
}
