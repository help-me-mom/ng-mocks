import { Component, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser';
import {
  TranslateLoader,
  TranslateModule,
  TranslatePipe,
} from '@ngx-translate/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';

@Component({
  selector: 'target',
  template: `{{ 'bug' | translate }}`,
  standalone: false,
})
class TargetComponent {
  public targetComponentNgxTranslate() {}
}

class NgMocksTranslateLoader extends TranslateLoader {
  getTranslation(lang: string) {
    return of(
      {
        'ng-mocks': {
          bug: 'feature',
        },
      }[lang] ?? {},
    );
  }
}

@NgModule({
  imports: [
    BrowserModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useClass: NgMocksTranslateLoader,
      },
      fallbackLang: 'ng-mocks',
    }),
  ],
  declarations: [TargetComponent],
  bootstrap: [TargetComponent],
})
class TargetModule {}

// https://github.com/help-me-mom/ng-mocks/issues/10752
describe('ngx-translate', () => {
  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('translates strings', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      expect(ngMocks.formatText(fixture)).toEqual('feature');
    });
  });

  describe('MockBuilder', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(
        TranslatePipe,
        value => `:translated:${value}:`,
      ),
    );

    it('mocks everything correctly', () => {
      const fixture = MockRender(TargetComponent);

      expect(ngMocks.formatText(fixture)).toEqual(':translated:bug:');
    });
  });
});
