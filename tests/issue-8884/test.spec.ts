import {
  Component,
  ContentChild,
  NgModule,
  TemplateRef,
  VERSION,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/8884
describe('issue-8884', () => {
  ngMocks.throwOnConsole();

  if (Number.parseInt(VERSION.major, 10) < 17) {
    it('needs a17+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('when standalone component does not import NgIf', () => {
    @Component({
      selector: 'app-standalone',
      ['standalone' as never]: true,
      template: `<ng-template [ngTemplateOutlet]="content" />`,
    })
    class StandaloneComponent {
      @ContentChild('content', {} as never)
      content?: TemplateRef<any>;
    }

    beforeEach(() => MockBuilder(null, StandaloneComponent));

    it('should create', () => {
      MockRender(`<app-standalone>Test content</app-standalone>`);

      expect(ngMocks.findInstance(StandaloneComponent)).toBeTruthy();
    });
  });

  describe('when NgIf is not avaiable to a component in a module', () => {
    @Component({
      selector: 'app-target',
      template: `<ng-template [ngTemplateOutlet]="content" />`,
    })
    class TargetComponent {
      @ContentChild('content', {} as never)
      content?: TemplateRef<any>;
    }

    @NgModule({
      declarations: [TargetComponent],
    })
    class TargetModule {}

    beforeEach(() => MockBuilder(null, TargetModule));

    it('should create', () => {
      MockRender(`<app-target>Test content</app-target>`);

      expect(ngMocks.findInstance(TargetComponent)).toBeTruthy();
    });
  });
});
