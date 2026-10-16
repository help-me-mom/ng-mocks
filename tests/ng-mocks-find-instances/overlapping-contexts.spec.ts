import {
  Component,
  Directive,
  Input,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[contextInstance]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class ContextDirective {
  @Input() public contextInstance = '';
}

@Directive({
  selector: '[repeatContext]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class RepeatContextDirective {
  public constructor(
    template: TemplateRef<object>,
    container: ViewContainerRef,
  ) {
    container.createEmbeddedView(template);
    container.createEmbeddedView(template);
  }
}

@Component({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <div class="context" contextInstance="outer">
      <section class="context" contextInstance="inner">
        <span
          *repeatContext
          class="context"
          contextInstance="repeated"
        ></span>
      </section>
      <span contextInstance="last"></span>
    </div>
  `,
})
class TargetComponent {}

describe('ng-mocks-find-instances:overlapping contexts', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent)
      .keep(ContextDirective)
      .keep(RepeatContextDirective),
  );

  it('keeps nested and embedded instances in order without duplicates between contexts', () => {
    const fixture = MockRender(TargetComponent);
    const expected = ngMocks
      .findAll(ContextDirective)
      .map(node => ngMocks.get(node, ContextDirective));

    const instances = ngMocks.findInstances(
      '.context',
      ContextDirective,
    );

    expect(
      instances.map(instance => instance.contextInstance),
    ).toEqual(['outer', 'inner', 'repeated', 'repeated', 'last']);
    for (let index = 0; index < instances.length; index += 1) {
      expect(instances[index]).toBe(expected[index]);
    }
    expect(instances[2]).not.toBe(instances[3]);
    // A completed search must not hide instances from the next search.
    expect(
      ngMocks.findInstances(fixture.debugElement, ContextDirective),
    ).toEqual(instances);
  });
});
