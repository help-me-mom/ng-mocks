import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  Input,
  TemplateRef,
  VERSION,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/11324
describe('issue-11324', () => {
  if (Number.parseInt(VERSION.major, 10) < 15) {
    it('needs a15+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  @Component({
    selector: 'app-baz',
    template: `Hello World!`,
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  })
  class BazComponent {}

  @Component({
    selector: 'app-foo',
    template: `<ng-template #foo><app-baz></app-baz></ng-template>`,
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
    ['imports' as never]: [CommonModule, BazComponent],
  })
  class FooComponent {
    @ViewChild('foo', { read: TemplateRef } as never)
    templateRef: TemplateRef<any> | null = null;
  }

  @Component({
    selector: 'app-bar',
    template: ``,
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  })
  class BarComponent implements AfterViewInit {
    constructor(private vcf: ViewContainerRef) {}

    @Input()
    context: any;

    @Input()
    templateRef: TemplateRef<any> | null = null;

    ngAfterViewInit(): void {
      this.vcf.clear();
      this.vcf.createEmbeddedView(this.templateRef!, this.context);
    }
  }

  beforeEach(async () => {
    const built = MockBuilder([FooComponent, BarComponent]).build();
    (built as any).teardown = { destroyAfterEach: false };
    TestBed.configureTestingModule({
      ...built,
    });
    return await TestBed.compileComponents();
  });

  it('should respect teardown configuration', () => {
    const fixture = MockRender(FooComponent); // ok
    const component = fixture.point.componentInstance;
    const templateRef = component.templateRef;

    ngMocks.flushTestBed();
    MockRender(BarComponent, { templateRef, context: {} }); // ok
    MockRender(
      BarComponent,
      { templateRef, context: {} },
      { reset: true },
    ); // ok

    expect(true).toBeTruthy();
  });
});
