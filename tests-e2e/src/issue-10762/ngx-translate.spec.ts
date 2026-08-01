import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  TranslatePipe,
  TranslateService,
  provideTranslateService,
} from '@ngx-translate/core';
import {
  MockBuilder,
  MockPipe,
  MockProvider,
  MockRender,
} from 'ng-mocks';

@Component({
  selector: 'app-target',
  template: `<h1>{{ 'TITLE' | translate }}</h1>`,
  standalone: true,
  imports: [TranslatePipe],
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
    describe('ng-mocks:MockPipe', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          imports: [
            TargetStandaloneComponent,
            MockPipe(TranslatePipe),
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
          TranslatePipe,
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
            imports: [TargetStandaloneComponent],
            providers: [
              provideTranslateService({ fallbackLang: 'en' }),
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
    describe('ng-mocks:MockPipe', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
          imports: [MockPipe(TranslatePipe)],
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
        return MockBuilder(TargetComponent, TranslatePipe);
      });

      it('creates component', () => {
        expect(() => MockRender(TargetComponent)).not.toThrow();
      });
    });

    describe('real', () => {
      beforeEach(() =>
        TestBed.configureTestingModule({
          declarations: [TargetComponent],
          imports: [TranslatePipe],
          providers: [
            provideTranslateService({ fallbackLang: 'en' }),
          ],
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
