import {
  Component,
  ContentChild,
  ContentChildren,
  Directive,
  ElementRef,
  QueryList,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[child2437]',
  standalone: false,
})
class ChildDirective {}

@Component({
  selector: 'target-2437',
  standalone: false,
  template: '<ng-content></ng-content>',
})
class TargetComponent {
  @ContentChild(ChildDirective, { descendants: false })
  public direct?: ChildDirective;

  @ContentChild(ChildDirective)
  public nested?: ChildDirective;

  @ContentChild(ChildDirective, {
    descendants: true,
    read: ElementRef,
  })
  public element?: ElementRef;

  @ContentChildren(ChildDirective)
  public directChildren?: QueryList<ChildDirective>;

  @ContentChildren(ChildDirective, { descendants: true })
  public allChildren?: QueryList<ChildDirective>;
}

@Directive({
  selector: '[query2437]',
  standalone: false,
})
class QueryDirective {
  @ContentChild(ChildDirective, { descendants: false })
  public direct?: ChildDirective;

  @ContentChild(ChildDirective, {
    descendants: true,
    read: ElementRef,
  })
  public nested?: ElementRef;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/2437
// ContentChild's descendants option was lost while copying decorator metadata.
// Mock query owners must retain the real owner's boundary and read token.
describe('issue-2437', () => {
  it('limits a real component query to direct children', async () => {
    await MockBuilder(TargetComponent).keep(ChildDirective);
    MockRender(
      '<target-2437><div><span child2437></span></div></target-2437>',
    );

    const target = ngMocks.findInstance(TargetComponent);
    expect(target.direct).toBeUndefined();
    expect(target.nested).toBe(ngMocks.findInstance(ChildDirective));
    expect(target.element && target.element.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(
      target.directChildren
        ? target.directChildren.length
        : undefined,
    ).toBe(0);
    expect(
      target.allChildren && target.allChildren.toArray(),
    ).toEqual([ngMocks.findInstance(ChildDirective)]);
  });

  it('preserves component query boundaries and read tokens on mocks', async () => {
    await MockBuilder().mock(TargetComponent).mock(ChildDirective);
    MockRender(
      '<target-2437><div><span child2437></span></div></target-2437>',
    );

    const target = ngMocks.findInstance(TargetComponent);
    expect(target.direct).toBeUndefined();
    expect(target.nested).toBe(ngMocks.findInstance(ChildDirective));
    expect(target.element && target.element.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
    expect(
      target.directChildren
        ? target.directChildren.length
        : undefined,
    ).toBe(0);
    expect(
      target.allChildren && target.allChildren.toArray(),
    ).toEqual([ngMocks.findInstance(ChildDirective)]);
  });

  it('still finds direct children on mock components', async () => {
    await MockBuilder().mock(TargetComponent).mock(ChildDirective);
    MockRender('<target-2437><span child2437></span></target-2437>');

    const target = ngMocks.findInstance(TargetComponent);
    expect(target.direct).toBe(ngMocks.findInstance(ChildDirective));
    expect(target.nested).toBe(target.direct);
    expect(
      target.directChildren && target.directChildren.toArray(),
    ).toEqual([ngMocks.findInstance(ChildDirective)]);
    expect(
      target.allChildren && target.allChildren.toArray(),
    ).toEqual([ngMocks.findInstance(ChildDirective)]);
  });

  it('preserves directive query boundaries on mocks', async () => {
    await MockBuilder().mock(QueryDirective).mock(ChildDirective);
    MockRender(
      '<div query2437><section><span child2437></span></section></div>',
    );

    const target = ngMocks.findInstance(QueryDirective);
    expect(target.direct).toBeUndefined();
    expect(target.nested && target.nested.nativeElement).toBe(
      ngMocks.find('span').nativeElement,
    );
  });
});
