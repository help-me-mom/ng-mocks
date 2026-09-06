import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  Directive,
  OnInit,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[itemContentTiming]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ItemDirective {}

@Component({
  selector: 'target-content-timing',
  changeDetection: ChangeDetectionStrategy.Default,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<ng-content></ng-content>',
})
class TargetComponent implements OnInit, AfterContentInit {
  @ContentChild(ItemDirective, { static: true })
  public staticChild?: ItemDirective;

  @ContentChild(ItemDirective, { static: false })
  public dynamicChild?: ItemDirective;

  public atInit?: ItemDirective;
  public dynamicAtInit?: ItemDirective;
  public atContentInit?: ItemDirective;

  public ngOnInit(): void {
    this.atInit = this.staticChild;
    this.dynamicAtInit = this.dynamicChild;
  }

  public ngAfterContentInit(): void {
    this.atContentInit = this.dynamicChild;
  }
}

@Component({
  selector: 'host-content-timing',
  changeDetection: ChangeDetectionStrategy.Default,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <target-content-timing>
      <ng-template #extra
        ><span itemContentTiming></span
      ></ng-template>
      <span itemContentTiming></span>
    </target-content-timing>
  `,
})
class HostComponent {
  @ViewChild('extra', { read: ViewContainerRef, static: true })
  public slot!: ViewContainerRef;

  @ViewChild('extra', { static: true })
  public extra!: TemplateRef<unknown>;
}

// Explicit static query options require Angular 8. Ordinary query and collection
// updates are covered from Angular 5 in updates.spec.ts.
describe('TestContentChild:static', () => {
  beforeEach(() =>
    MockBuilder()
      .keep(HostComponent)
      .keep(TargetComponent)
      .mock(ItemDirective),
  );

  it('resolves static and dynamic queries at their Angular lifecycle boundaries', () => {
    const fixture = MockRender(HostComponent);
    const host = fixture.point.componentInstance;
    const target = ngMocks.findInstance(TargetComponent);
    const initial = ngMocks.findInstance(ItemDirective);

    // Static queries are ready at OnInit; dynamic queries at AfterContentInit.
    expect(target.atInit).toBe(initial);
    expect(target.dynamicAtInit).toBeUndefined();
    expect(target.atContentInit).toBe(initial);
    expect(target.staticChild).toBe(initial);
    expect(target.dynamicChild).toBe(initial);

    // Inserting a child updates dynamic queries but preserves the static result.
    host.slot.createEmbeddedView(host.extra);
    fixture.detectChanges();
    const inserted = ngMocks.findInstances(ItemDirective)[0];
    expect(inserted).not.toBe(initial);
    expect(target.dynamicChild).toBe(inserted);
    expect(target.staticChild).toBe(initial);

    // Removing the view restores the dynamic result without changing the static one.
    host.slot.clear();
    fixture.detectChanges();
    expect(target.dynamicChild).toBe(initial);
    expect(target.staticChild).toBe(initial);
  });
});
