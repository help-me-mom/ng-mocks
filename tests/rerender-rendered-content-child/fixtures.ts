import { CommonModule } from '@angular/common';
import { Component, ContentChild, NgModule, TemplateRef } from '@angular/core';

import { staticFalse } from '..';

@Component({
  selector: 'ccc',
  template: `<ng-template ngFor [ngForOf]="[]" [ngForTemplate]="injectedBlock"></ng-template>`,
})
export class ContentChildComponent {
  @ContentChild('block', staticFalse) public injectedBlock?: TemplateRef<any>;
}

@NgModule({
  declarations: [ContentChildComponent],
  exports: [ContentChildComponent],
  imports: [CommonModule],
})
export class ContentChildModule {}
