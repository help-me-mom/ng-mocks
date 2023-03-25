import { Component } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import {
  MockBuilder,
  MockProvider,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Component({
  selector: 'target-538',
  template: `
    <div
      [innerHTML]="
        domSanitizer.bypassSecurityTrustHtml(
          '<strong>value1</strong>'
        )
      "
    ></div>
  `,
})
class TargetComponent {
  public constructor(public readonly domSanitizer: DomSanitizer) {}
}

// TypeError: view.root.sanitizer.sanitize is not a function
// @see https://github.com/help-me-mom/ng-mocks/issues/538
describe('issue-538', () => {
  describe('keep', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('renders expected real values', () => {
      MockRender(TargetComponent);

      expect(ngMocks.formatHtml(ngMocks.find('div'))).toEqual(
        '<strong>value1</strong>',
      );
    });
  });

  describe('mock', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent).mock(DomSanitizer, {
        bypassSecurityTrustHtml: (value: string) => `${value.length}`,
        sanitize: (_: any, value: string) => `${value}`,
      }),
    );

    it('renders mess due to internal injections', () => {
      MockRender(TargetComponent);

      expect(ngMocks.formatHtml(ngMocks.find('div'))).toEqual('23');
    });
  });

  describe('mock-render', () => {
    beforeEach(() => MockBuilder(TargetComponent));

    it('renders expected mock values', () => {
      MockRender(TargetComponent, null, {
        providers: [
          MockProvider(DomSanitizer, {
            bypassSecurityTrustHtml: (value: string) =>
              `${value.length}`,
          }),
        ],
      });

      expect(ngMocks.formatHtml(ngMocks.find('div'))).toEqual('23');
    });
  });
});
