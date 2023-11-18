import { CommonModule } from '@angular/common';
import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TranslocoModule,
  provideTranslocoScope,
  TranslocoTestingModule,
} from '@ngneat/transloco';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import { TestComponent } from '../../../tests/ng-mocks-search-with-no-fixture/fixtures';

const langs = {
  en: {
    core: {
      test: 'Hello',
    },
  },
  fr: {
    core: {
      test: 'Bonjour',
    },
  },
};

@Component({
  selector: 'target',
  template: `
    <nav *transloco="let t">
      <span>{{ t('core.test') }}</span>
    </nav>
  `,
})
class TargetComponent {
  public targetComponentTransloco() {}
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CommonModule, TranslocoModule],
  providers: [
    provideTranslocoScope({
      scope: 'core',
      loader: {
        en: () => Promise.resolve(langs.en),
        fr: () => Promise.resolve(langs.fr),
      },
    }),
  ],
  exports: [TargetComponent],
})
class TargetModule {}

const getTranslocoModule = () =>
  TranslocoTestingModule.forRoot({
    langs,
    translocoConfig: {
      availableLangs: ['en', 'fr'],
      defaultLang: 'en',
    },
  });

// @see https://github.com/help-me-mom/ng-mocks/issues/7431
describe('transloco', () => {
  describe('classic', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [TestComponent],
        imports: [getTranslocoModule()],
      }).compileComponents(),
    );

    it('tests translation', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      expect(ngMocks.formatHtml(fixture)).toContain(
        '<span>Hello</span>',
      );
    });
  });

  // TranslocoTestingModule uses TranslocoModule with special providers.
  // So to keep TranslocoModule in the test,
  // we just need to keep TranslocoModule and to add providers from TranslocoTestingModule.
  describe('ng-mocks', () => {
    beforeEach(() =>
      MockBuilder(
        [TargetComponent, TranslocoModule],
        TargetModule,
      ).provide(getTranslocoModule().providers ?? []),
    );

    it('tests translation', () => {
      const fixture = MockRender(TargetComponent);
      expect(ngMocks.formatHtml(fixture)).toContain(
        '<span>Hello</span>',
      );
    });
  });
});
