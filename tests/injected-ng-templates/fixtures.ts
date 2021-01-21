import { Component, ContentChild, Input, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';

@Component({
  selector: 'custom-injection',
  template: `
    <div *ngIf="items && items.length">
      <ng-template ngFor [ngForOf]="items" [ngForTemplate]="injectedBlock"></ng-template>
    </div>
    <div #child></div>
  `,
})
export class CustomInjectionComponent<T> {
  @ContentChild('block', { static: false } as any) public injectedBlock?: TemplateRef<any>;
  @Input() public items?: T[];
  @ViewChild('child', { static: false } as any) public ownChild?: ViewContainerRef;
}
