import { Directive, TemplateRef } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[tpl]',
})
class TplDirective {
  public constructor(public readonly tpl: TemplateRef<any>) {}
}

// @see https://github.com/ike18t/ng-mocks/issues/289
describe('issue-289', () => {
  beforeEach(() => MockBuilder(null, TplDirective));

  it('checks whether rendered html is visible from ng-template element', () => {
    const fixture = MockRender(`
      1
      <ng-template tpl>
        tpl1
        <ng-template tpl>
          tpl2
        </ng-template>
      </ng-template>
      2
    `);
    // double check we don't change elements via lookup.
    expect(fixture.debugElement.childNodes.length).toEqual(3);
    expect(ngMocks.formatHtml(fixture)).toEqual('1 2');
    // double check we don't change elements via lookup.
    expect(fixture.debugElement.childNodes.length).toEqual(3);

    // now only the 1st template is visible
    {
      const templates = ngMocks.revealAll(fixture, TplDirective);
      // double check we don't change elements via lookup.
      expect(fixture.debugElement.childNodes.length).toEqual(3);
      expect(templates.length).toEqual(1);
      const [block1El] = templates;
      expect(ngMocks.formatHtml(block1El)).toEqual('');

      const block1 = ngMocks.get(block1El, TplDirective);
      ngMocks.render(block1, block1);
      // cool stuff
      expect(ngMocks.formatHtml(block1El)).toEqual('tpl1');
    }
    // but at least something
    expect(ngMocks.formatHtml(fixture)).toEqual('1 tpl1 2');

    // now the 2nd template is visible
    {
      const templates = ngMocks.revealAll(fixture, TplDirective);
      expect(templates.length).toEqual(2);
      const [, block2El] = templates;
      expect(ngMocks.formatHtml(block2El)).toEqual('');

      const block2 = ngMocks.get(block2El, TplDirective);
      ngMocks.render(block2, block2);
      // cool stuff
      expect(ngMocks.formatHtml(block2El)).toEqual('tpl2');
    }
    // but at least something
    expect(ngMocks.formatHtml(fixture)).toEqual('1 tpl1 tpl2 2');
  });
});
