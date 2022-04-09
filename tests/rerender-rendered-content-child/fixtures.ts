import { CommonModule } from '@angular/common';
import { Component, ContentChild, NgModule, TemplateRef } from '@angular/core';

@Component({
  selector: 'ccc',
  template: '<ng-template ngFor [ngForOf]="[]" [ngForTemplate]="injectedBlock"></ng-template>',
})
export class ContentChildComponent {
  @ContentChild('block', {} as any) public injectedBlock?: TemplateRef<any>;
}

@NgModule({
  declarations: [ContentChildComponent],
  exports: [ContentChildComponent],
  imports: [CommonModule],
})
export class ContentChildModule {}
