import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

export interface ICustomNgForContext {
  $implicit: string; // real value
  myFirst: boolean;
  myIndex: number;
  myLast: boolean;
}

@Directive({
  selector: '[customNgForWithOf]',
})
export class CustomNgForWithOfDirective {
  protected templateRef: TemplateRef<ICustomNgForContext>;
  protected viewContainerRef: ViewContainerRef;

  public constructor(templateRef: TemplateRef<ICustomNgForContext>, viewContainerRef: ViewContainerRef) {
    this.templateRef = templateRef;
    this.viewContainerRef = viewContainerRef;
  }
  @Input('customNgForWithOfOf') public set setItems(items: string[]) {
    this.viewContainerRef.clear();

    for (let index = 0; index < items.length; index += 1) {
      const value = items[index];
      this.viewContainerRef.createEmbeddedView(this.templateRef, {
        $implicit: value,
        myFirst: index === 0,
        myIndex: index,
        myLast: index + 1 === items.length,
      });
    }
  }
}
