Error.stackTraceLimit = Infinity;

// Reflect.metadata polyfill is only needed in the JIT mode which we use only for unit tests
import 'core-js/es6/reflect'; // tslint:disable-line
import 'core-js/es7/reflect'; // tslint:disable-line

import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

jasmine.getEnv().allowRespy(true);

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting());
