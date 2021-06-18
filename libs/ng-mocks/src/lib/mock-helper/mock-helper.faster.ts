import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import ngMocksStack, { NgMocksStack } from '../common/ng-mocks-stack';
import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperFasterInstall from './mock-helper.faster-install';
import mockHelperFlushTestBed from './mock-helper.flush-test-bed';

const resetFixtures = (stack: NgMocksStack) => {
  const activeFixtures: Array<ComponentFixture<any> & { ngMocksStackId?: any }> =
    (getTestBed() as any)._activeFixtures || /* istanbul ignore next */ [];

  for (let i = activeFixtures.length - 1; i >= 0; i -= 1) {
    if (!activeFixtures[i].ngMocksStackId || activeFixtures[i].ngMocksStackId === stack.id) {
      activeFixtures[i].destroy();
      activeFixtures.splice(i, 1);
    }
  }
  if (activeFixtures.length === 0) {
    mockHelperFlushTestBed();
  }
};

let needInstall = true;
export default () => {
  // istanbul ignore next
  if (needInstall) {
    ngMocksStack.install();
    needInstall = false;
  }

  mockHelperFasterInstall();

  beforeAll(() => {
    if (ngMocksUniverse.global.has('bullet:customized')) {
      TestBed.resetTestingModule();
    }
    ngMocksUniverse.global.set('bullet', true);
    ngMocksStack.subscribePop(resetFixtures);
  });

  afterAll(() => {
    ngMocksStack.unsubscribePop(resetFixtures);
    ngMocksUniverse.global.delete('bullet');
    if (ngMocksUniverse.global.has('bullet:reset')) {
      TestBed.resetTestingModule();
    }
  });
};
