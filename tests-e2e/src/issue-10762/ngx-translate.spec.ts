import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TranslateModule,
  TranslateService,
} from '@ngx-translate/core';
import {
  MockBuilder,
  MockModule,
  MockProvider,
  MockRender,
} from 'ng-mocks';

@Component({
  selector: 'app-target',
  template: `<h1>{{ 'TITLE' | translate }}</h1>`,
  standalone: true,
  imports: [TranslateModule],
})
class TargetStandaloneComponent {
  constructor(private translateService: TranslateService) {
    this.translateService.setTranslation('en', {
      TITLE: 'hello world',
    });
  }
}

@Component({
  selector: 'app-target',
  template: `<h1>{{ 'TITLE' | translate }}</h1>`,
  standalone: false,
})
class TargetComponent {}

describe('issue-10762 - ngx-translate', () => {
  describe('standalone component', () => {
    describe('ng-mocks:MockModule', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          imports: [
            TargetStandaloneComponent,
            MockModule(TranslateModule),
          ],
          providers: [MockProvider(TranslateService)],
        }).compileComponents(),
      );

      it('creates component', () => {
        expect(() =>
          TestBed.createComponent(
            TargetStandaloneComponent,
          ).detectChanges(),
        ).not.toThrow();
      });
    });

    describe('ng-mocks:MockBuilder', () => {
      beforeEach(() => {
        return MockBuilder(TargetStandaloneComponent, [
          TranslateModule,
          TranslateService,
        ]);
      });

      it('creates component', () => {
        expect(() =>
          MockRender(TargetStandaloneComponent),
        ).not.toThrow();
      });

      describe('real', () => {
        beforeEach(() =>
          TestBed.configureTestingModule({
            imports: [
              TargetStandaloneComponent,
              TranslateModule.forRoot({ fallbackLang: 'en' }),
            ],
          }).compileComponents(),
        );

        it('creates component', () => {
          expect(() =>
            TestBed.createComponent(
              TargetStandaloneComponent,
            ).detectChanges(),
          ).not.toThrow();
        });
      });
    });
  });

  describe('not standalone component', () => {
    describe('ng-mocks:MockModule', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
          imports: [MockModule(TranslateModule)],
        }).compileComponents(),
      );

      it('creates component', () => {
        expect(() =>
          TestBed.createComponent(TargetComponent).detectChanges(),
        ).not.toThrow();
      });
    });

    describe('ng-mocks:MockBuilder', () => {
      beforeEach(() => {
        return MockBuilder(TargetComponent, TranslateModule);
      });

      it('creates component', () => {
        expect(() => MockRender(TargetComponent)).not.toThrow();
      });
    });

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
          imports: [TranslateModule.forRoot({ fallbackLang: 'en' })],
        }).compileComponents(),
      );

      it('creates component', () => {
        expect(() =>
          TestBed.createComponent(TargetComponent).detectChanges(),
        ).not.toThrow();
      });
    });
  });
});
