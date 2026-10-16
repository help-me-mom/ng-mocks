import {
  DebugNode,
  Directive,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[target]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetDirective {
  public constructor(
    public readonly templateRef: TemplateRef<object>,
    public readonly viewContainerRef: ViewContainerRef,
  ) {}
}

describe('ng-mocks-crawl:embedded-views', () => {
  beforeEach(() => MockBuilder(TargetDirective));

  it('preserves root order and structural parents for sibling embedded views', () => {
    const fixture = MockRender(`
      <ng-template #first target><span>first</span><span>second</span></ng-template>
      <ng-template #second target><span>third</span><span>fourth</span></ng-template>
    `);
    const first = ngMocks.reveal(fixture, '#first');
    const second = ngMocks.reveal(fixture, '#second');
    const firstDirective = ngMocks.get(first, TargetDirective);
    const secondDirective = ngMocks.get(second, TargetDirective);
    firstDirective.viewContainerRef.createEmbeddedView(
      firstDirective.templateRef,
    );
    secondDirective.viewContainerRef.createEmbeddedView(
      secondDirective.templateRef,
    );
    fixture.detectChanges();

    const values: string[] = [];
    const parents: Array<DebugNode | undefined> = [];
    ngMocks.crawl(fixture.debugElement, (node, parent) => {
      if (node.nativeNode.nodeName === 'SPAN') {
        values.push(node.nativeNode.textContent);
        parents.push(parent);
      }
    });

    expect(values).toEqual(['first', 'second', 'third', 'fourth']);
    expect(parents[0]).toBe(first);
    expect(parents[1]).toBe(first);
    expect(parents[2]).toBe(second);
    expect(parents[3]).toBe(second);
  });
});
