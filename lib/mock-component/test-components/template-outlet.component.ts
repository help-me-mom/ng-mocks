import { Component, ContentChild, TemplateRef } from '@angular/core';

@Component({
  selector: 'template-outlet-component',
  template: `
    <h1><template [ngTemplateOutlet]="injectedBlock1"></template></h1>
    <h2><template [ngTemplateOutlet]="injectedBlock2"></template></h2>
    <h3><ng-content></ng-content></h3>
  `,
})
export class TemplateOutletComponent {
  @ContentChild('block1') injectedBlock1: TemplateRef<any>;
  @ContentChild('block2') injectedBlock2: TemplateRef<any>;
}
