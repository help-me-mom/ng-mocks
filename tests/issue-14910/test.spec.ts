import {
  Component,
  ComponentRef,
  ContentChild,
  ContentChildren,
  Directive,
  NgModule,
  QueryList,
  ViewChild,
  ViewChildren,
  ViewContainerRef,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockBuilder } from 'ng-mocks';

let childConstructorCalls = 0;
let realConstructorCalls = 0;

@Component({
  selector: 'child-14910',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'original child',
})
class ChildComponent {
  public constructor() {
    childConstructorCalls += 1;
  }
}

@Component({
  selector: 'real-14910',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'unconfigured real child',
})
class RealComponent {
  public constructor() {
    realConstructorCalls += 1;
  }
}

@Component({
  selector: 'view-14910',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <ng-container #slot></ng-container>
    <ng-container #slot></ng-container>
  `,
})
class ViewComponent {
  public child!: ComponentRef<ChildComponent>;

  @ViewChild('slot', { read: ViewContainerRef, static: true })
  public set container(value: ViewContainerRef) {
    // Creation in the setter requires the patch before Angular assigns the query.
    this.child = value.createComponent(ChildComponent);
  }

  @ViewChildren('slot', { read: ViewContainerRef })
  public containers!: QueryList<ViewContainerRef>;
}

@Component({
  selector: 'content-14910',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '<ng-content></ng-content>',
})
class ContentComponent {
  public child!: ComponentRef<ChildComponent>;

  @ContentChild('slot', { read: ViewContainerRef, static: true })
  public set container(value: ViewContainerRef) {
    this.child = value.createComponent(ChildComponent);
  }

  @ContentChildren('slot', { read: ViewContainerRef })
  public containers!: QueryList<ViewContainerRef>;
}

@Component({
  selector: 'host-14910',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <content-14910>
      <ng-container #slot></ng-container>
      <ng-container #slot></ng-container>
    </content-14910>
  `,
})
class HostComponent {
  @ViewChild(ContentComponent, { static: true })
  public content!: ContentComponent;
}

@Directive({
  selector: '[slotOwner]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class SlotOwnerDirective {
  public child?: ComponentRef<ChildComponent>;

  @ContentChild('slot', { read: ViewContainerRef, static: false })
  public set container(value: ViewContainerRef) {
    this.child = value.createComponent(ChildComponent);
  }

  @ContentChildren('slot', { read: ViewContainerRef })
  public containers!: QueryList<ViewContainerRef>;
}

@Component({
  selector: 'directive-host-14910',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <section slotOwner>
      <ng-container #slot></ng-container>
      <ng-container #slot></ng-container>
    </section>
  `,
})
class DirectiveHostComponent {
  @ViewChild(SlotOwnerDirective, { static: true })
  public owner!: SlotOwnerDirective;
}

@Component({
  selector: 'injected-14910',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class InjectedComponent {
  public constructor(public readonly container: ViewContainerRef) {}
}

@NgModule({
  declarations: [
    ChildComponent,
    ContentComponent,
    DirectiveHostComponent,
    HostComponent,
    InjectedComponent,
    SlotOwnerDirective,
    ViewComponent,
  ],
})
class TargetModule {}

// The component-type createComponent overload requires Angular 13.
// Run this suite alone to reproduce first use: an earlier injected container
// otherwise installs the shared prototype patch before either query is read.
// @see https://github.com/help-me-mom/ng-mocks/issues/14910
describe('issue-14910', () => {
  beforeEach(() => {
    childConstructorCalls = 0;
    realConstructorCalls = 0;

    return MockBuilder(
      [
        ContentComponent,
        DirectiveHostComponent,
        HostComponent,
        InjectedComponent,
        SlotOwnerDirective,
        ViewComponent,
      ],
      TargetModule,
    );
  });

  it('mocks dynamic children from view queries before their setters run', () => {
    const fixture = TestBed.createComponent(ViewComponent);
    fixture.detectChanges();
    const target = fixture.componentInstance;

    expect(isMockOf(target.child.instance, ChildComponent)).toBe(
      true,
    );
    expect(childConstructorCalls).toBe(0);
    expect(target.child.location.nativeElement.textContent).toBe('');
    expect(target.containers.length).toBe(2);

    const child =
      target.containers.last.createComponent(ChildComponent);
    child.changeDetectorRef.detectChanges();

    expect(isMockOf(child.instance, ChildComponent)).toBe(true);
    expect(child.instance).not.toBe(target.child.instance);
    expect(childConstructorCalls).toBe(0);
    expect(child.location.nativeElement.textContent).toBe('');

    // A component absent from MockBuilder's dependency map remains real.
    const real =
      target.containers.last.createComponent(RealComponent);
    real.changeDetectorRef.detectChanges();

    expect(isMockOf(real.instance, RealComponent)).toBe(false);
    expect(realConstructorCalls).toBe(1);
    expect(real.location.nativeElement.textContent).toBe(
      'unconfigured real child',
    );
  });

  it('mocks dynamic children from projected content queries', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const target = fixture.componentInstance.content;

    expect(isMockOf(target.child.instance, ChildComponent)).toBe(
      true,
    );
    expect(childConstructorCalls).toBe(0);
    expect(target.child.location.nativeElement.textContent).toBe('');
    expect(target.containers.length).toBe(2);

    const child =
      target.containers.last.createComponent(ChildComponent);
    child.changeDetectorRef.detectChanges();

    expect(isMockOf(child.instance, ChildComponent)).toBe(true);
    expect(child.instance).not.toBe(target.child.instance);
    expect(childConstructorCalls).toBe(0);
    expect(child.location.nativeElement.textContent).toBe('');
  });

  it('mocks children created by a directive with dynamic content queries', () => {
    const fixture = TestBed.createComponent(DirectiveHostComponent);
    const target = fixture.componentInstance.owner;

    expect(target.child).toBeUndefined();
    expect(childConstructorCalls).toBe(0);

    fixture.detectChanges();
    const first = target.child!;

    expect(isMockOf(first.instance, ChildComponent)).toBe(true);
    expect(childConstructorCalls).toBe(0);
    expect(first.location.nativeElement.textContent).toBe('');
    expect(target.containers.length).toBe(2);

    const child =
      target.containers.last.createComponent(ChildComponent);
    child.changeDetectorRef.detectChanges();

    expect(isMockOf(child.instance, ChildComponent)).toBe(true);
    expect(child.instance).not.toBe(first.instance);
    expect(childConstructorCalls).toBe(0);
    expect(child.location.nativeElement.textContent).toBe('');
  });

  it('preserves injected container mocking and unconfigured real children', () => {
    const fixture = TestBed.createComponent(InjectedComponent);
    fixture.detectChanges();
    const target = fixture.componentInstance;
    const child = target.container.createComponent(ChildComponent);
    child.changeDetectorRef.detectChanges();

    expect(isMockOf(child.instance, ChildComponent)).toBe(true);
    expect(childConstructorCalls).toBe(0);
    expect(child.location.nativeElement.textContent).toBe('');

    const real = target.container.createComponent(RealComponent);
    real.changeDetectorRef.detectChanges();

    expect(isMockOf(real.instance, RealComponent)).toBe(false);
    expect(realConstructorCalls).toBe(1);
    expect(real.location.nativeElement.textContent).toBe(
      'unconfigured real child',
    );
  });
});
