import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  QueryList,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[itemContentUpdates]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ItemDirective {}

@Component({
  selector: 'target-content-updates',
  changeDetection: ChangeDetectionStrategy.Default,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<ng-content></ng-content>',
})
class TargetComponent implements AfterContentInit {
  @ContentChild(ItemDirective, {} as never)
  public child?: ItemDirective;

  @ContentChildren(ItemDirective)
  public children?: QueryList<ItemDirective>;

  public atContentInit?: ItemDirective;
  public childrenAtContentInit?: ItemDirective[];

  public ngAfterContentInit(): void {
    this.atContentInit = this.child;
    this.childrenAtContentInit =
      this.children && this.children.toArray();
  }
}

@Component({
  selector: 'host-content-updates',
  changeDetection: ChangeDetectionStrategy.Default,
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <target-content-updates>
      <ng-template #extra
        ><span itemContentUpdates></span
      ></ng-template>
      <span itemContentUpdates></span>
    </target-content-updates>
  `,
})
class HostComponent {
  @ViewChild('extra', { read: ViewContainerRef } as never)
  public slot?: ViewContainerRef;

  @ViewChild('extra', {} as never)
  public extra?: TemplateRef<any>;
}

// These decorator queries and collection changes are supported from Angular 5.
// Keep explicit static options in static.spec.ts so this file stays on the full spread.
describe('TestContentChild:updates', () => {
  beforeEach(() =>
    MockBuilder()
      .keep(HostComponent)
      .keep(TargetComponent)
      .mock(ItemDirective),
  );

  it('updates child queries and notifies collection changes when content is inserted or removed', () => {
    const fixture = MockRender(HostComponent);
    const host = fixture.point.componentInstance;
    const target = ngMocks.findInstance(TargetComponent);
    const initial = ngMocks.findInstance(ItemDirective);

    // Both queries are ready by AfterContentInit.
    expect(target.atContentInit).toBe(initial);
    expect(target.childrenAtContentInit).toEqual([initial]);
    expect(target.child).toBe(initial);
    if (!target.children) {
      throw new Error('ContentChildren was not initialized');
    }
    expect(target.children.toArray()).toEqual([initial]);

    // Observe collection changes when embedded content is inserted or removed.
    const changes: number[] = [];
    const subscription = target.children.changes.subscribe(
      (children: QueryList<ItemDirective>) => {
        changes.push(children.length);
      },
    );

    // Inserting a child updates the first result and the collection order.
    if (!host.slot || !host.extra) {
      throw new Error('The projected template was not initialized');
    }
    host.slot.createEmbeddedView(host.extra);
    fixture.detectChanges();
    const inserted = ngMocks.findInstances(ItemDirective)[0];
    expect(inserted).not.toBe(initial);
    expect(target.child).toBe(inserted);
    expect(target.children.toArray()).toEqual([inserted, initial]);
    expect(changes).toEqual([2]);

    // Removing the view restores the initial query results and emits again.
    host.slot.clear();
    fixture.detectChanges();
    expect(target.child).toBe(initial);
    expect(target.children.toArray()).toEqual([initial]);
    expect(changes).toEqual([2, 1]);
    subscription.unsubscribe();
  });
});
