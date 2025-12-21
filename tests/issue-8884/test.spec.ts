import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  ContentChild,
  NgModule,
  TemplateRef,
  VERSION,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/8884
// New control flow doesn't import NgIf or CommonModule by default.
// However, it still allows to use conditions, and if `ContentChild` is used,
// it causes errors such as "Can't bind to 'ngIf' since it isn't a known property of 'div'".
// The fix is to remove dependency on NgIf or CommonModule.
describe('issue-8884', () => {
  ngMocks.throwOnConsole();

  if (Number.parseInt(VERSION.major, 10) < 17) {
    it('needs a17+', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('standalone component without NgIf', () => {
    @Component({
      selector: 'standalone-8884',
      ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
      ['imports' as never]: [NgTemplateOutlet],
      template: `<ng-template [ngTemplateOutlet]="content" />`,
    })
    class Standalone8884Component {
      @ContentChild('content', {} as never)
      content?: TemplateRef<any>;
    }

    describe('real', () => {
      beforeEach(() => MockBuilder(Standalone8884Component));

      it('renders content', () => {
        const fixture = MockRender(`
          <standalone-8884>
            <ng-template #content>content</ng-template>
          </standalone-8884>
        `);

        expect(ngMocks.formatText(fixture)).toEqual('content');
      });
    });

    describe('mock', () => {
      beforeEach(() => MockBuilder(null, Standalone8884Component));

      it('renders content', () => {
        const fixture = MockRender(`
          <standalone-8884>
            <ng-template #content>content</ng-template>
          </standalone-8884>
        `);
        expect(ngMocks.formatText(fixture)).toEqual('');

        ngMocks.render(
          ngMocks.findInstance(Standalone8884Component),
          ngMocks.findTemplateRef('content'),
        );
        expect(ngMocks.formatText(fixture)).toEqual('content');
      });
    });
  });

  describe('classic component without NgIf import in its module', () => {
    @Component({
      selector: 'target-8884',
      ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
      template: `<ng-template [ngTemplateOutlet]="content" />`,
    })
    class Target8884Component {
      @ContentChild('content', {} as never)
      content?: TemplateRef<any>;
    }

    @NgModule({
      imports: [NgTemplateOutlet],
      declarations: [Target8884Component],
      exports: [Target8884Component],
    })
    class TargetModule {}

    describe('real', () => {
      beforeEach(() => MockBuilder(TargetModule));

      it('renders content', () => {
        const fixture = MockRender(`
          <target-8884>
            <ng-template #content>content</ng-template>
          </target-8884>
        `);

        expect(ngMocks.formatText(fixture)).toEqual('content');
      });
    });

    describe('mock', () => {
      beforeEach(() => MockBuilder(null, TargetModule));

      it('render contents', () => {
        const fixture = MockRender(`
          <target-8884>
            <ng-template #content>content</ng-template>
          </target-8884>
        `);

        expect(ngMocks.formatText(fixture)).toEqual('');

        ngMocks.render(
          ngMocks.findInstance(Target8884Component),
          ngMocks.findTemplateRef('content'),
        );
        expect(ngMocks.formatText(fixture)).toEqual('content');
      });
    });
  });
});
