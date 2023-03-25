import { Component, ContentChild, TemplateRef } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-find-template-refs-317',
  template: 'target',
})
class TargetComponent {
  @ContentChild('tpl', {} as any)
  public readonly tpl?: TemplateRef<any>;
}

describe('ng-mocks-find-template-refs:317', () => {
  beforeEach(() => MockBuilder(null, TargetComponent));

  it('finds by css selector', () => {
    const fixture = MockRender(`
      <div data-id="div">
        <target-ng-mocks-find-template-refs-317>
          <ng-template #tpl>mock</ng-template>
        </target-ng-mocks-find-template-refs-317>
      </div>
      <span data-id="span"></span>
    `);

    const component = ngMocks.findInstance(TargetComponent);

    const [tpl] = ngMocks.findTemplateRefs('div', 'tpl');
    expect(ngMocks.formatText(fixture)).toEqual('');
    ngMocks.render(component, tpl);
    expect(ngMocks.formatText(fixture)).toEqual('mock');

    expect(ngMocks.findTemplateRefs(['data-id'], 'tpl')).toEqual([
      tpl,
    ]);
    expect(
      ngMocks.findTemplateRefs(['data-id', 'div'], 'tpl'),
    ).toEqual([tpl]);

    expect(ngMocks.findTemplateRefs('span', 'tpl')).toEqual([]);
  });
});
