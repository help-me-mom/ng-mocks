import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import {
  MockBuilder,
  MockRender,
  NG_MOCKS_ROOT_PROVIDERS,
  ngMocks,
} from 'ng-mocks';

import { AppComponent } from './app/app.component';
import { AppModule } from './app/app.module';

// @see https://github.com/help-me-mom/ng-mocks/issues/151
describe('issue-151', () => {
  let fixture: ComponentFixture<AppComponent>;

  describe('mock AppRoutingModule', () => {
    beforeEach(() =>
      TestBed.configureTestingModule(
        MockBuilder(
          [
            AppComponent,
            RouterModule,
            RouterTestingModule,
            NG_MOCKS_ROOT_PROVIDERS,
          ],
          AppModule,
        ).build(),
      ),
    );

    beforeEach(async () => {
      fixture = MockRender(AppComponent);
      const router = ngMocks.findInstance(Router);
      if (fixture.ngZone) {
        fixture.ngZone.run(() => router.initialNavigation());
      }
      await fixture.whenStable();
    });

    it('should create the app', () => {
      // asserting that app-hello is replaced with a mock copy (no content) and detected by router.
      expect(fixture.nativeElement.innerHTML).toContain(
        '<app-hello></app-hello>',
      );
    });
  });
});
