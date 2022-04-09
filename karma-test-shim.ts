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

import { ngMocks } from 'ng-mocks';

ngMocks.autoSpy('jasmine');
jasmine.getEnv().allowRespy(true);

// jasmine.getEnv().addReporter({
//   specDone: spec => {
//     console.log(`end: ${spec.fullName}`);
//   },
//   specStarted: spec => {
//     console.log(`start: ${spec.fullName}`);
//   },
// });

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
