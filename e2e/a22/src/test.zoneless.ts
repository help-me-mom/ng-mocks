// This file initializes the Karma test environment without Zone.js.

import { CommonModule } from '@angular/common'; // eslint-disable-line import-x/order
import { ApplicationModule, NgModule, provideZonelessChangeDetection } from '@angular/core'; // eslint-disable-line import-x/order
import { getTestBed } from '@angular/core/testing';
import { BrowserModule } from '@angular/platform-browser'; // eslint-disable-line import-x/order
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router'; // eslint-disable-line import-x/order
import { MockService, ngMocks } from 'ng-mocks'; // eslint-disable-line import-x/order

ngMocks.autoSpy('jasmine');

@NgModule({
  providers: [provideZonelessChangeDetection()],
})
export class TestModule {}

ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));

ngMocks.globalKeep(ApplicationModule, true);
ngMocks.globalKeep(CommonModule, true);
ngMocks.globalKeep(BrowserModule, true);

jasmine.getEnv().allowRespy(true);

getTestBed().initTestEnvironment([BrowserTestingModule, TestModule], platformBrowserTesting(), {
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
