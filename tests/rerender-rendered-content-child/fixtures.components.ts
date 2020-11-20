import { Component, ContentChild, TemplateRef } from '@angular/core';

import { staticFalse } from '..';

@Component({
  selector: 'ccc',
  template: `<ng-template ngFor [ngForOf]="[]" [ngForTemplate]="injectedBlock"></ng-template>`,
})
export class ContentChildComponent {
  @ContentChild('block', { ...staticFalse }) public injectedBlock: TemplateRef<any>;
}
