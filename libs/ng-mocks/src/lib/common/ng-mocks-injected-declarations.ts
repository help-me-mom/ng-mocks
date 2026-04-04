import { TestBed, TestBedStatic } from '@angular/core/testing';

import helperReplayInstance from '../mock-service/helper.replay-instance';

import coreDefineProperty from './core.define-property';
import { mapEntries } from './core.helpers';
import { getSourceOfMock } from './func.get-source-of-mock';
import { isMockNgDef } from './func.is-mock-ng-def';
import ngMocksUniverse from './ng-mocks-universe';

type NgMocksInjectedDeclaration = {
  resolved?: any;
  seed: any;
};

type NgMocksTestBed = TestBedStatic & {
  get?: (token: any, ...args: any[]) => any;
  inject?: (token: any, ...args: any[]) => any;
  ngMocksInjectedDeclarations?: Map<any, NgMocksInjectedDeclaration>;
  ngMocksInjectedDeclarationsLock?: boolean;
  ngMocksMockDeclarations?: Map<any, any>;
};

const getNgMocksTestBed = (): NgMocksTestBed => TestBed as never;

const hasTrackableInstance = (value: any): boolean =>
  value !== null && (typeof value === 'function' || typeof value === 'object');

const isMockedDeclaration = (declaration: any): boolean =>
  !!declaration && (isMockNgDef(declaration, 'c') || isMockNgDef(declaration, 'd') || isMockNgDef(declaration, 'p'));

const getMockDeclaration = (source: any): any => {
  if (typeof source !== 'function') {
    return undefined;
  }

  const declaration = getNgMocksTestBed().ngMocksMockDeclarations?.get(source);
  if (isMockedDeclaration(declaration)) {
    return declaration;
  }

  const builtDeclaration = ngMocksUniverse.getBuildDeclaration(source);
  if (isMockedDeclaration(builtDeclaration)) {
    return builtDeclaration;
  }

  const cachedDeclaration = ngMocksUniverse.cacheDeclarations.get(source);
  if (isMockedDeclaration(cachedDeclaration)) {
    return cachedDeclaration;
  }
};

const getTrackedDeclaration = (token: any): any => {
  if (typeof token !== 'function') {
    return undefined;
  }

  const source = getSourceOfMock(token);
  const declaration = getMockDeclaration(source);

  return declaration && isMockedDeclaration(declaration) ? source : undefined;
};

const getInjectedDeclarations = (): Map<any, NgMocksInjectedDeclaration> => {
  const testBed = getNgMocksTestBed();

  if (!testBed.ngMocksInjectedDeclarations) {
    coreDefineProperty(TestBed, 'ngMocksInjectedDeclarations', new Map());
  }

  return getNgMocksTestBed().ngMocksInjectedDeclarations as Map<any, NgMocksInjectedDeclaration>;
};

const resolveTrackedDeclaration = (source: any, result: any): any => {
  if (!source || !hasTrackableInstance(result)) {
    return result;
  }

  const entry = getNgMocksTestBed().ngMocksInjectedDeclarations?.get(source);
  if (!entry || result === entry.seed || result === entry.resolved) {
    return result;
  }

  // Angular created a fresh declaration-local instance. Replay the descriptors from the explicit
  // TestBed.inject seed so spy identities and ad-hoc overrides survive into the rendered instance.
  helperReplayInstance(entry.seed, result);
  entry.resolved = result;

  return result;
};

export const rememberMockDeclarations = (mocks?: Map<any, any>): void => {
  if (!mocks) {
    return;
  }

  const next = new Map(getNgMocksTestBed().ngMocksMockDeclarations);
  for (const [key, value] of mapEntries(mocks)) {
    next.set(key, value);
  }

  coreDefineProperty(TestBed, 'ngMocksMockDeclarations', next);
};

export const resetInjectedDeclarations = (): void => {
  coreDefineProperty(TestBed, 'ngMocksInjectedDeclarations', undefined);
  coreDefineProperty(TestBed, 'ngMocksInjectedDeclarationsLock', undefined);
  coreDefineProperty(TestBed, 'ngMocksMockDeclarations', undefined);
};

export const rememberInjectedDeclaration = (token: any, result: any): any => {
  const source = getTrackedDeclaration(token);
  if (!source || !hasTrackableInstance(result)) {
    return result;
  }

  const injectedDeclarations = getInjectedDeclarations();
  const entry = injectedDeclarations.get(source);
  if (!entry) {
    injectedDeclarations.set(source, {
      seed: result,
    });

    return result;
  }

  // Once a local declaration instance has been resolved, TestBed.inject should keep returning that
  // replayed instance instead of the original seed object.
  return entry.resolved ?? entry.seed;
};

export const resolveInjectedDeclaration = (token: any, result: any): any =>
  resolveTrackedDeclaration(getTrackedDeclaration(token), result);

export const resolveMockDeclaration = (declaration: any, result: any): any =>
  resolveTrackedDeclaration(getTrackedDeclaration(declaration), result);
