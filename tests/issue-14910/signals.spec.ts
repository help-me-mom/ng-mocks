import {
  ChangeDetectionStrategy,
  Component,
  contentChild,
  contentChildren,
  isSignal,
  viewChild,
  viewChildren,
  ViewContainerRef,
} from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

let childConstructors = 0;

@Component({
  selector: 'child-14910-signals',
  standalone: true,
  template: 'real dynamic child',
})
class ChildComponent {
  public constructor() {
    childConstructors += 1;
  }
}

@Component({
  selector: 'target-14910-signals',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    real query owner
    <ng-container #view></ng-container>
    <ng-container #view></ng-container>
    <ng-content></ng-content>
  `,
})
class TargetComponent {
  public readonly view = viewChild.required('view', {
    read: ViewContainerRef,
  });
  public readonly views = viewChildren('view', {
    read: ViewContainerRef,
  });
  public readonly content = contentChild.required('content', {
    read: ViewContainerRef,
  });
  public readonly contents = contentChildren('content', {
    read: ViewContainerRef,
  });
}

@Component({
  selector: 'host-14910-signals',
  standalone: true,
  imports: [TargetComponent],
  changeDetection: ChangeDetectionStrategy.Default,
  template: `
    <target-14910-signals>
      <ng-container #content></ng-container>
      <ng-container #content></ng-container>
    </target-14910-signals>
  `,
})
class HostComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14910
describe('issue-14910:signals', () => {
  // The root TypeScript-only runner does not transform signal queries.
  // Angular-compiled spread targets execute these cases from Angular 17.2.
  if (
    !(TargetComponent as any).ɵcmp?.viewQuery ||
    !(TargetComponent as any).ɵcmp?.contentQueries
  ) {
    it('needs compiled signal query metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => {
    childConstructors = 0;

    return MockBuilder(HostComponent)
      .keep(TargetComponent)
      .mock(ChildComponent);
  });

  it('mocks dynamic creation through the first viewChild signal result', () => {
    const fixture = MockRender(TargetComponent);
    const target = fixture.point.componentInstance;

    // Query reads create the VCR without going through its injection hook.
    // Do not inject another VCR first: that would mask the missing patch.
    const container = target.view();
    expect(isSignal(target.view)).toBe(true);
    expect(container.length).toBe(0);

    const child = container.createComponent(ChildComponent);
    fixture.detectChanges();

    expect(target.view()).toBe(container);
    expect(container.length).toBe(1);
    expect(isMockOf(child.instance, ChildComponent)).toBe(true);
    expect(ngMocks.find(ChildComponent).componentInstance).toBe(
      child.instance,
    );
    expect(childConstructors).toBe(0);
    expect(ngMocks.formatText(fixture)).toContain('real query owner');
    expect(ngMocks.formatText(fixture)).not.toContain(
      'real dynamic child',
    );
  });

  it('mocks dynamic creation through every viewChildren signal result', () => {
    const fixture = MockRender(TargetComponent);
    const target = fixture.point.componentInstance;
    const containers = target.views();

    expect(isSignal(target.views)).toBe(true);
    expect(containers.length).toBe(2);
    expect(containers[0]).not.toBe(containers[1]);

    const first = containers[0].createComponent(ChildComponent);
    const second = containers[1].createComponent(ChildComponent);
    fixture.detectChanges();

    expect(target.views()[0]).toBe(containers[0]);
    expect(target.views()[1]).toBe(containers[1]);
    expect(containers[0].length).toBe(1);
    expect(containers[1].length).toBe(1);
    expect(isMockOf(first.instance, ChildComponent)).toBe(true);
    expect(isMockOf(second.instance, ChildComponent)).toBe(true);
    expect(first.instance).not.toBe(second.instance);
    expect(
      ngMocks
        .findAll(ChildComponent)
        .map(node => node.componentInstance),
    ).toEqual([first.instance, second.instance]);
    expect(childConstructors).toBe(0);
    expect(ngMocks.formatText(fixture)).toContain('real query owner');
    expect(ngMocks.formatText(fixture)).not.toContain(
      'real dynamic child',
    );
  });

  it('mocks dynamic creation through the first contentChild signal result', () => {
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const container = target.content();

    expect(isSignal(target.content)).toBe(true);
    expect(container.length).toBe(0);

    const child = container.createComponent(ChildComponent);
    fixture.detectChanges();

    expect(target.content()).toBe(container);
    expect(container.length).toBe(1);
    expect(isMockOf(child.instance, ChildComponent)).toBe(true);
    expect(ngMocks.find(ChildComponent).componentInstance).toBe(
      child.instance,
    );
    expect(childConstructors).toBe(0);
    expect(ngMocks.formatText(fixture)).toContain('real query owner');
    expect(ngMocks.formatText(fixture)).not.toContain(
      'real dynamic child',
    );
  });

  it('mocks dynamic creation through every contentChildren signal result', () => {
    const fixture = MockRender(HostComponent);
    const target = ngMocks.findInstance(TargetComponent);
    const containers = target.contents();

    expect(isSignal(target.contents)).toBe(true);
    expect(containers.length).toBe(2);
    expect(containers[0]).not.toBe(containers[1]);

    const first = containers[0].createComponent(ChildComponent);
    const second = containers[1].createComponent(ChildComponent);
    fixture.detectChanges();

    expect(target.contents()[0]).toBe(containers[0]);
    expect(target.contents()[1]).toBe(containers[1]);
    expect(containers[0].length).toBe(1);
    expect(containers[1].length).toBe(1);
    expect(isMockOf(first.instance, ChildComponent)).toBe(true);
    expect(isMockOf(second.instance, ChildComponent)).toBe(true);
    expect(first.instance).not.toBe(second.instance);
    expect(
      ngMocks
        .findAll(ChildComponent)
        .map(node => node.componentInstance),
    ).toEqual([first.instance, second.instance]);
    expect(childConstructors).toBe(0);
    expect(ngMocks.formatText(fixture)).toContain('real query owner');
    expect(ngMocks.formatText(fixture)).not.toContain(
      'real dynamic child',
    );
  });
});
