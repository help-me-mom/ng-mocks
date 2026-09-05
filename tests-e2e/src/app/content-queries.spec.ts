import {
  Component,
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
  public readonly element = contentChild(ItemDirective, {
    read: ElementRef,
  });
  public readonly direct = contentChildren(ItemDirective);
  public readonly all = contentChildren(ItemDirective, {
    descendants: true,
  });
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

// Signal queries need Angular's compiler transform, so this example lives in
// the compiled application corpus and is spread starting with Angular 17.2.
describe('TestContentChild:signals', () => {
  // Reset signal customizations after each test.
  MockInstance.scope();

  it('queries mocked content and updates after projected content changes', async () => {
    // Keep the host and query owner real; mock the projected directive.
    await MockBuilder(HostComponent).keep(TargetComponent);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    // Read the first child, required child, and element.
    expect(target.first()).toBe(items[0]);
    expect(target.required()).toBe(items[0]);
    expect(target.element()?.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    // Compare the direct children with the full descendant collection.
    expect(target.direct()).toEqual([items[0]]);
    expect(target.all()).toEqual(items);
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
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([items[1]]);
  });

  it('returns no optional results and enforces a required query when content is missing', async () => {
    // Render the real owner without projecting any children.
    await MockBuilder(TargetComponent);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.first()).toBeUndefined();
    expect(target.element()).toBeUndefined();
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([]);
    // Reading the required query reports the missing child.
    let message: string | undefined;
    try {
      target.required();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0951');
  });

  it('customizes a signal property when the query owner itself is mocked', async () => {
    // Keep the host real and mock its imported declarations.
    await MockBuilder(HostComponent);

    // Provide the signal properties before creating the mock component.
    const first = signal<ItemDirective | undefined>(undefined);
    const all = signal<readonly ItemDirective[]>([]);
    MockInstance(TargetComponent, 'first', first);
    MockInstance(TargetComponent, 'all', all);
    MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    // Projection does not populate the supplied signals.
    expect(isMockOf(target, TargetComponent)).toBe(true);
    expect(target.first()).toBeUndefined();
    expect(target.all()).toEqual([]);

    // Set the values explicitly and read them through the mock.
    first.set(items[0]);
    all.set(items);
    expect(target.first()).toBe(items[0]);
    expect(target.all()).toEqual(items);
  });
});
