// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router';
import { MockService, ngMocks } from 'ng-mocks';

ngMocks.autoSpy('jasmine');

// In case, if you use @angular/router and Angular 14+.
// You might want to set a mock of DefaultTitleStrategy as TitleStrategy.
// A14 fix: making DefaultTitleStrategy to be a default mock for TitleStrategy
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp,
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};
jasmine.getEnv().allowRespy(true);

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());

// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
