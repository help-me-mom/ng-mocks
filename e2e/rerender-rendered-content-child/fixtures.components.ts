// tslint:disable:max-classes-per-file

import { Component, ContentChild, TemplateRef } from '@angular/core';
import { staticFalse } from '../../tests';

@Component({
  selector: 'ccc',
  template: `<ng-template ngFor [ngForOf]="[]" [ngForTemplate]="injectedBlock"></ng-template>`,
})
export class ContentChildComponent {
  @ContentChild('block', {...staticFalse}) injectedBlock: TemplateRef<any>;
}
