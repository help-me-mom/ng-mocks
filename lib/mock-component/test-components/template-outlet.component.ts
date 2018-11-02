import { Component, ContentChild, ElementRef, TemplateRef, ViewChild } from '@angular/core';

@Component({
  selector: 'template-outlet-component',
  template: `
    <h1><template [ngTemplateOutlet]="injectedBlock1"></template></h1>
    <h2><template [ngTemplateOutlet]="injectedBlock2"></template></h2>
    <h3><ng-content></ng-content></h3>
    <h4 #block4>own ref</h4>
  `,
})
export class TemplateOutletComponent {
  // injected.
  @ContentChild('block1') injectedBlock1: TemplateRef<any>;

  // injected.
  @ContentChild('block2') injectedBlock2: TemplateRef<any>;

  // undefined (not injected).
  @ContentChild('block3') injectedBlock3: TemplateRef<any>;

  // ref to own template.
  @ViewChild('block4') ownBlock3: ElementRef;
}
