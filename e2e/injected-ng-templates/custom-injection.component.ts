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
  @ContentChild('block', { static: false }) injectedBlock: TemplateRef<any>;
  @Input() items?: T[];
  @ViewChild('child', { static: false }) ownChild: ViewContainerRef;
}
