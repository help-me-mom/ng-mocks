// This file is required by karma.conf.js and loads recursively all the .spec and framework files

import { NgModule, provideZoneChangeDetection } from '@angular/core';
import { getTestBed } from '@angular/core/testing';
import { BrowserTestingModule, platformBrowserTesting } from '@angular/platform-browser/testing';

const zoneWindow = window as Window & { Zone?: unknown };

@NgModule({
  providers: [typeof zoneWindow.Zone === 'undefined' ? [] : provideZoneChangeDetection()],
})
class TestModule {}

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment([BrowserTestingModule, TestModule], platformBrowserTesting(), {
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
