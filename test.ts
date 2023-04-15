Error.stackTraceLimit = Number.POSITIVE_INFINITY;

import 'core-js/proposals/reflect-metadata';

import 'core-js/modules/es.array.fill';
import 'core-js/modules/es.array.find';
import 'core-js/modules/es.array.from';
import 'core-js/modules/es.array.iterator';
import 'core-js/modules/es.function.name';
import 'core-js/modules/es.object.assign';
import 'core-js/modules/es.object.get-prototype-of';
import 'core-js/modules/es.object.is';
import 'core-js/modules/es.object.keys';
import 'core-js/modules/es.string.code-point-at';
import 'core-js/modules/es.string.ends-with';
import 'core-js/modules/es.string.from-code-point';
import 'core-js/modules/es.string.starts-with';
import 'core-js/modules/es.symbol';

import 'zone.js';
import 'zone.js/testing';

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

import { MockService, ngMocks } from 'ng-mocks'; // eslint-disable-line import/order

ngMocks.autoSpy('jasmine');
jasmine.getEnv().allowRespy(true);

// In case, if you use @angular/router and Angular 14+.
// You might want to set a mock of DefaultTitleStrategy as TitleStrategy.
// A14 fix: making DefaultTitleStrategy to be a default mock for TitleStrategy
import { DefaultTitleStrategy, TitleStrategy } from '@angular/router'; // eslint-disable-line import/order
ngMocks.defaultMock(TitleStrategy, () => MockService(DefaultTitleStrategy));

// Usually, *ngIf and other declarations from CommonModule aren't expected to be mocked.
// The code below keeps them.
import { CommonModule } from '@angular/common'; // eslint-disable-line import/order
import { ApplicationModule } from '@angular/core'; // eslint-disable-line import/order
import { BrowserModule } from '@angular/platform-browser'; // eslint-disable-line import/order
ngMocks.globalKeep(ApplicationModule, true);
ngMocks.globalKeep(CommonModule, true);
ngMocks.globalKeep(BrowserModule, true);

// jasmine.getEnv().addReporter({
//   specDone: spec => {
//     console.log(`end: ${spec.fullName}`);
//   },
//   specStarted: spec => {
//     console.log(`start: ${spec.fullName}`);
//   },
// });

// Initialize the Angular testing environment.
getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  errorOnUnknownElements: true,
  errorOnUnknownProperties: true,
});
