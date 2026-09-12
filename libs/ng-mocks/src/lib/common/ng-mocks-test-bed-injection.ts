import { TestBedStatic } from '@angular/core/testing';

import helperCreateClone from '../mock-service/helper.create-clone';

import coreDefineProperty from './core.define-property';
import { rememberInjectedDeclaration } from './ng-mocks-injected-declarations';

type NgMocksTestBed = TestBedStatic & {
  get?: (token: any, ...args: any[]) => any;
  inject?: (token: any, ...args: any[]) => any;
  ngMocksGetInstalled?: boolean;
  ngMocksInjectInstalled?: boolean;
};

const createTestBedInjection = (original: (token: any, ...args: any[]) => any, instance: NgMocksTestBed) =>
  helperCreateClone(original, undefined, undefined, (token: any, ...args: any[]) => {
    // Tests often mutate the object returned by TestBed.inject before Angular constructs the
    // declaration instance used inside the render tree, so remember that seed for later replay.
    return rememberInjectedDeclaration(token, original.call(instance, token, ...args));
  });

export const installTestBedInjection = (instance: NgMocksTestBed): void => {
  if (instance.inject && !instance.ngMocksInjectInstalled) {
    coreDefineProperty(instance, 'inject', createTestBedInjection(instance.inject, instance), true);
    coreDefineProperty(instance, 'ngMocksInjectInstalled', true);
  }
  // istanbul ignore next: TestBed.get exists only on legacy Angular targets, but it must share the same seed registry.
  if (instance.get && !instance.ngMocksGetInstalled) {
    coreDefineProperty(instance, 'get', createTestBedInjection(instance.get, instance), true);
    coreDefineProperty(instance, 'ngMocksGetInstalled', true);
  }
};
