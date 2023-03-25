import { Component, ContentChild } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'target-445',
  template: '<ng-content></ng-content>',
})
export class ByAttributeComponent {
  @ContentChild('[someAttribute]', {} as any)
  public readonly contentChild?: any;
}

// @see https://github.com/help-me-mom/ng-mocks/issues/445
describe('issue-445', () => {
  describe('real', () => {
    beforeEach(() => MockBuilder(ByAttributeComponent));

    it('should render correctly without content child but fails', () => {
      expect(() =>
        MockRender('<target-445></target-445>', {}, true),
      ).not.toThrowError();
    });

    it('should render correctly with content child but fails', () => {
      expect(() =>
        MockRender(
          '<target-445><ng-template someAttribute>Yeeeeaaah</ng-template></target-445>',
          {},
          true,
        ),
      ).not.toThrowError();
    });
  });

  describe('mock', () => {
    beforeEach(() => MockBuilder().mock(ByAttributeComponent));

    it('should render correctly without content child but fails', () => {
      expect(() =>
        MockRender('<target-445></target-445>', {}, true),
      ).not.toThrowError();
    });

    it('should render correctly with content child but fails', () => {
      expect(() =>
        MockRender(
          '<target-445><ng-template someAttribute>Yeeeeaaah</ng-template></target-445>',
          {},
          true,
        ),
      ).not.toThrowError();
    });
  });
});
