import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

export interface ICustomNgForContext {
  $implicit: string; // real value
  myFirst: boolean;
  myIndex: number;
  myLast: boolean;
}

@Directive({
  selector: '[customNgForWithoutOf]'
})
export class CustomNgForWithoutOfDirective {

  @Input('customNgForWithoutOf') set setItems(items: string[]) {
    this.viewContainerRef.clear();

    items.forEach((value, index) => this.viewContainerRef.createEmbeddedView(this.templateRef, {
      $implicit: value,
      myFirst: index === 0,
      myIndex: index,
      myLast: index + 1 === items.length,
    }));
  }

  protected templateRef: TemplateRef<ICustomNgForContext>;
  protected viewContainerRef: ViewContainerRef;

  constructor(
    templateRef: TemplateRef<ICustomNgForContext>,
    viewContainerRef: ViewContainerRef,
  ) {
    this.templateRef = templateRef;
    this.viewContainerRef = viewContainerRef;
  }
}
