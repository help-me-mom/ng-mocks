import {
  Component,
  computed,
  contentChild,
  contentChildren,
  Directive,
  ElementRef,
  Input,
  signal,
} from '@angular/core';

import {
  isMockOf,
  MockBuilder,
  MockInstance,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: '[signalContentItem]',
  standalone: true,
})
class ItemDirective {
  @Input() public signalContentItem = '';
}

@Component({
  selector: 'target-signal-content',
  standalone: true,
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  public readonly first = contentChild(ItemDirective);
  public readonly required = contentChild.required(ItemDirective);
  public readonly directChild = contentChild(ItemDirective, {
    descendants: false,
  });
  public readonly element = contentChild(ItemDirective, {
    read: ElementRef,
  });
  public readonly direct = contentChildren(ItemDirective);
  public readonly all = contentChildren(ItemDirective, {
    descendants: true,
  });
  public readonly elements = contentChildren(ItemDirective, {
    descendants: true,
    read: ElementRef,
  });
  public readonly firstLabel = computed(
    () => this.first()?.signalContentItem,
  );
  public readonly labels = computed(() =>
    this.all().map(item => item.signalContentItem),
  );
}

@Component({
  selector: 'host-signal-content',
  standalone: true,
  imports: [ItemDirective, TargetComponent],
  template: `
    <target-signal-content>
      @if (show()) {
        <span signalContentItem="first"></span>
      }
      <div><span signalContentItem="nested"></span></div>
    </target-signal-content>
  `,
})
class HostComponent {
  public readonly show = signal(true);
}

describe('TestContentChild:signals', () => {
  // The root TypeScript-only runner does not transform signal queries.
  // Angular-compiled spread targets execute these cases from Angular 17.2.
  if (!(TargetComponent as any).ɵcmp.contentQueries) {
    it('needs compiled signal query metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  // Reset signal customizations after each test.
  MockInstance.scope();

  it('updates contentChild signals and computed values when projected content changes', async () => {
    // Keep the host and query owner real; mock the projected directive.
    await MockBuilder(HostComponent).keep(TargetComponent);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    // Read the first child, required child, and element.
    expect(target.first()).toBe(items[0]);
    expect(target.required()).toBe(items[0]);
    expect(target.directChild()).toBe(items[0]);
    expect(target.firstLabel()).toBe('first');
    expect(target.element()?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(items.map(item => item.signalContentItem)).toEqual([
      'first',
      'nested',
    ]);
    expect(isMockOf(items[0], ItemDirective)).toBe(true);

    // Remove the direct child and check the updated query results.
    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.first()).toBe(items[1]);
    expect(target.required()).toBe(items[1]);
    expect(target.directChild()).toBeUndefined();
    expect(target.firstLabel()).toBe('nested');
    expect(target.element()?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );

    // Restoring the direct child creates a new instance and updates every query.
    fixture.point.componentInstance.show.set(true);
    fixture.detectChanges();
    const restored = ngMocks.findInstances(ItemDirective);
    expect(restored[0]).not.toBe(items[0]);
    expect(restored[1]).toBe(items[1]);
    expect(target.first()).toBe(restored[0]);
    expect(target.required()).toBe(restored[0]);
    expect(target.directChild()).toBe(restored[0]);
    expect(target.firstLabel()).toBe('first');
    expect(target.element()?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
  });

  it('updates contentChildren signals, read tokens, and computed collections', async () => {
    // Keep the owner real and query its projected mock directives.
    await MockBuilder(HostComponent).keep(TargetComponent);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);
    const elements = ngMocks
      .findAll('span')
      .map(element => element.nativeElement);

    // Compare direct children, descendants, and the elements read from them.
    expect(target.direct()).toEqual([items[0]]);
    expect(target.all()).toEqual(items);
    expect(target.labels()).toEqual(['first', 'nested']);
    expect(
      target.elements().map(element => element.nativeElement),
    ).toEqual([elements[0], elements[1]]);
    expect(isMockOf(items[0], ItemDirective)).toBe(true);
    expect(isMockOf(items[1], ItemDirective)).toBe(true);

    // Removing the direct child updates both collections and their computed consumer.
    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([items[1]]);
    expect(target.labels()).toEqual(['nested']);
    expect(
      target.elements().map(element => element.nativeElement),
    ).toEqual([elements[1]]);

    // Restoring it restores collection order while preserving the nested child.
    fixture.point.componentInstance.show.set(true);
    fixture.detectChanges();
    const restored = ngMocks.findInstances(ItemDirective);
    expect(restored[0]).not.toBe(items[0]);
    expect(restored[1]).toBe(items[1]);
    expect(target.direct()).toEqual([restored[0]]);
    expect(target.all()).toEqual(restored);
    expect(target.labels()).toEqual(['first', 'nested']);
    expect(
      target.elements().map(element => element.nativeElement),
    ).toEqual([ngMocks.find('span').nativeElement, elements[1]]);
  });

  it('returns no optional results and enforces a required query when content is missing', async () => {
    // Render the real owner without projecting any children.
    await MockBuilder(TargetComponent);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.first()).toBeUndefined();
    expect(target.directChild()).toBeUndefined();
    expect(target.element()).toBeUndefined();
    expect(target.firstLabel()).toBeUndefined();
    // Reading the required query reports the missing child.
    let message: string | undefined;
    try {
      target.required();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0951');
  });

  it('returns empty contentChildren signals when content is missing', async () => {
    await MockBuilder(TargetComponent);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([]);
    expect(target.elements()).toEqual([]);
    expect(target.labels()).toEqual([]);
  });

  it('customizes optional and required contentChild signals on a mocked owner', async () => {
    // Keep the host real and mock its imported declarations.
    await MockBuilder(HostComponent);

    // Provide the signal properties before creating the mock component.
    const first = signal<ItemDirective | undefined>(undefined);
    const fallback = new ItemDirective();
    const required = signal(fallback);
    MockInstance(TargetComponent, 'first', first);
    MockInstance(TargetComponent, 'required', required);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    // Projection does not populate the supplied signals.
    expect(isMockOf(target, TargetComponent)).toBe(true);
    expect(target.first()).toBeUndefined();
    expect(target.required()).toBe(fallback);

    // Set the values explicitly and read them through the mock.
    first.set(items[0]);
    required.set(items[0]);
    expect(target.first()).toBe(items[0]);
    expect(target.required()).toBe(items[0]);

    // Changing projected content does not update ordinary signals on the mock.
    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.first()).toBe(items[0]);
    expect(target.required()).toBe(items[0]);

    // The test controls missing optional values and replacement required values.
    first.set(undefined);
    required.set(items[1]);
    expect(target.first()).toBeUndefined();
    expect(target.required()).toBe(items[1]);
  });

  it('customizes contentChildren signals on a mocked owner', async () => {
    await MockBuilder(HostComponent);

    // Provide each collection signal before creating the mock component.
    const direct = signal<readonly ItemDirective[]>([]);
    const all = signal<readonly ItemDirective[]>([]);
    MockInstance(TargetComponent, 'direct', direct);
    MockInstance(TargetComponent, 'all', all);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    expect(isMockOf(target, TargetComponent)).toBe(true);
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([]);

    // Set the direct and descendant collections independently.
    direct.set([items[0]]);
    all.set(items);
    expect(target.direct()).toEqual([items[0]]);
    expect(target.all()).toEqual(items);

    // Projection changes do not populate or clear these ordinary signals.
    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.direct()).toEqual([items[0]]);
    expect(target.all()).toEqual(items);

    // Apply the changed collection values explicitly.
    direct.set([]);
    all.set([items[1]]);
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([items[1]]);
  });
});
