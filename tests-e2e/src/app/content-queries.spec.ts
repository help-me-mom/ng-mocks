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
  MockInstance.scope();

  it('queries mocked content and updates after projected content changes', async () => {
    await MockBuilder(HostComponent).keep(TargetComponent);
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    expect(target.first()).toBe(items[0]);
    expect(target.required()).toBe(items[0]);
    expect(target.element()?.nativeElement).toBe(
      fixture.nativeElement.querySelector('span'),
    );
    expect(target.direct()).toEqual([items[0]]);
    expect(target.all()).toEqual(items);
    expect(items.map(item => item.signalContentItem)).toEqual([
      'first',
      'nested',
    ]);
    expect(isMockOf(items[0], ItemDirective)).toBe(true);

    fixture.point.componentInstance.show.set(false);
    fixture.detectChanges();
    expect(target.first()).toBe(items[1]);
    expect(target.required()).toBe(items[1]);
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([items[1]]);
  });

  it('returns no optional results and enforces a required query when content is missing', async () => {
    await MockBuilder(TargetComponent);
    MockRender(TargetComponent);
    const target = ngMocks.findInstance(TargetComponent);

    expect(target.first()).toBeUndefined();
    expect(target.element()).toBeUndefined();
    expect(target.direct()).toEqual([]);
    expect(target.all()).toEqual([]);
    let message: string | undefined;
    try {
      target.required();
    } catch (error) {
      message = (error as Error).message;
    }
    expect(message).toContain('NG0951');
  });

  it('customizes a signal property when the query owner itself is mocked', async () => {
    await MockBuilder(HostComponent);
    const first = signal<ItemDirective | undefined>(undefined);
    const all = signal<readonly ItemDirective[]>([]);
    MockInstance(TargetComponent, 'first', first);
    MockInstance(TargetComponent, 'all', all);
    MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const items = ngMocks.findInstances(ItemDirective);

    expect(isMockOf(target, TargetComponent)).toBe(true);
    expect(target.first()).toBeUndefined();
    expect(target.all()).toEqual([]);

    first.set(items[0]);
    all.set(items);
    expect(target.first()).toBe(items[0]);
    expect(target.all()).toEqual(items);
  });
});
