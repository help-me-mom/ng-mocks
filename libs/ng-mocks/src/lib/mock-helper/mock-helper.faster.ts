import { ComponentFixture, getTestBed, TestBed } from '@angular/core/testing';

import ngMocksUniverse from '../common/ng-mocks-universe';

import mockHelperFasterInstall from './mock-helper.faster-install';
import mockHelperFlushTestBed from './mock-helper.flush-test-bed';

const resetFixtures = (id: never) => {
  const activeFixtures: Array<ComponentFixture<any> & { ngMocksStackId?: any }> =
    (getTestBed() as any)._activeFixtures || /* istanbul ignore next */ [];

  let active = 0;
  for (let i = activeFixtures.length - 1; i >= 0; i -= 1) {
    if (!activeFixtures[i].ngMocksStackId || activeFixtures[i].ngMocksStackId === id) {
      activeFixtures[i].ngMocksStackId = undefined;
    } else {
      active += 1;
    }
  }
  if (active === 0) {
    mockHelperFlushTestBed();
  }
};

const idAdd = (id: any) => {
  const bulletStack: any[] = ngMocksUniverse.global.get('bullet:stack') ?? [];
  bulletStack.push(id);
  ngMocksUniverse.global.set('bullet:stack', bulletStack);
  ngMocksUniverse.global.set('bullet:stack:id', id);
};
const idRemove = (id: any) => {
  const bulletStack: any[] = ngMocksUniverse.global.get('bullet:stack');
  bulletStack.splice(bulletStack.indexOf(id), 1);
  if (bulletStack.length > 0) {
    ngMocksUniverse.global.set('bullet:stack:id', bulletStack[bulletStack.length - 1]);
  } else {
    ngMocksUniverse.global.delete('bullet:stack:id');
  }

  resetFixtures(id as never);
};

export default () => {
  mockHelperFasterInstall();

  const idAll = {};
  const idEach = {};

  beforeAll(() => {
    if (ngMocksUniverse.global.has('bullet:customized')) {
      TestBed.resetTestingModule();
    }
    ngMocksUniverse.global.set('bullet', true);
    idAdd(idAll);
  });

  beforeEach(() => {
    idAdd(idEach);
  });
  afterEach(() => {
    idRemove(idEach);
  });

  afterAll(() => {
    idRemove(idAll);
    ngMocksUniverse.global.delete('bullet');
    if (ngMocksUniverse.global.has('bullet:reset')) {
      TestBed.resetTestingModule();
    }
  });
};
