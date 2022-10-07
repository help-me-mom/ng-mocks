import { AfterContentInit, Component, ContentChildren, Directive, Input, QueryList, TemplateRef } from '@angular/core';

@Directive({
  selector: '[type]',
})
export class CustomTypeDirective {
  @Input() public type = '';

  public constructor(public template: TemplateRef<any>) {}
}

@Component({
  selector: 'custom-root',
  template: `
    <div *ngIf="template1" class="template">
      <ng-container *ngTemplateOutlet="template; context: { $implicit: context }"></ng-container>
    </div>
    <div *ngIf="template1" class="template1">
      <ng-container *ngTemplateOutlet="template1; context: { $implicit: context1 }"></ng-container>
    </div>
    <div class="nested">
      <ng-content></ng-content>
    </div>
  `,
})
export class CustomRootComponent implements AfterContentInit {
  public context = ['0'];
  public context1 = ['1'];
  public template?: TemplateRef<any>;
  public template1?: TemplateRef<any>;
  public template2?: TemplateRef<any>;
  @ContentChildren(CustomTypeDirective) public templates?: QueryList<CustomTypeDirective>;

  public ngAfterContentInit(): void {
    for (const template of this.templates ? this.templates.toArray() : []) {
      switch (template.type) {
        case 'template1': {
          this.template1 = template.template;
          break;
        }
        case 'template2': {
          this.template2 = template.template;
          break;
        }
        default: {
          this.template = template.template;
        }
      }
    }
  }
}
