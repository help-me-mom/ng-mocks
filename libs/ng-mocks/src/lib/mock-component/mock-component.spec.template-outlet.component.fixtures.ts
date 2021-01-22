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
  @ContentChild('block1', { static: false } as any) public injectedBlock1?: TemplateRef<any>;

  // injected.
  @ContentChild('block2', { static: false } as any) public injectedBlock2?: TemplateRef<any>;

  // undefined (not injected).
  @ContentChild('block3', { static: false } as any) public injectedBlock3?: TemplateRef<any>;

  // ref to own template.
  @ViewChild('block4', { static: false } as any) public ownBlock3?: ElementRef;
}
