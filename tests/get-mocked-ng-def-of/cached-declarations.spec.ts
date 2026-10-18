import { Directive, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  getMockedNgDefOf,
  isMockedNgDefOf,
  MockBuilder,
  MockDirective,
  ngMocks,
} from 'ng-mocks';

@Directive({
  selector: '[cachedLookupPlain]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class PlainDirective {}

@Injectable()
@Directive({
  selector: '[cachedLookupInjectable]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class InjectableDirective {}

// A current keep or exclusion must remain authoritative over an earlier cached mock.
// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('getMockedNgDefOf:cached-declarations', () => {
  beforeEach(() => ngMocks.reset());
  afterEach(() => ngMocks.reset());

  it('rejects an earlier mock when the current builder keeps a plain declaration', async () => {
    const cachedMock = MockDirective(PlainDirective);

    await MockBuilder().keep(PlainDirective);

    expect(() => getMockedNgDefOf(PlainDirective, 'd')).toThrow(
      new Error(`There is no mock for ${PlainDirective.name}`),
    );
    expect(() => getMockedNgDefOf(PlainDirective)).toThrow(
      new Error(`There is no mock for ${PlainDirective.name}`),
    );
    expect(() => getMockedNgDefOf(cachedMock, 'd')).toThrow(
      new Error(`There is no mock for ${PlainDirective.name}`),
    );
    expect(() => getMockedNgDefOf(cachedMock)).toThrow(
      new Error(`There is no mock for ${PlainDirective.name}`),
    );
  });

  it('rejects an earlier mock when the current builder keeps an injectable declaration', async () => {
    const cachedMock = MockDirective(InjectableDirective);

    await MockBuilder().keep(InjectableDirective);

    expect(() => getMockedNgDefOf(InjectableDirective, 'd')).toThrow(
      new Error(`There is no mock for ${InjectableDirective.name}`),
    );
    expect(() => getMockedNgDefOf(InjectableDirective)).toThrow(
      new Error(`There is no mock for ${InjectableDirective.name}`),
    );
    expect(() => getMockedNgDefOf(cachedMock, 'd')).toThrow(
      new Error(`There is no mock for ${InjectableDirective.name}`),
    );
    expect(() => getMockedNgDefOf(cachedMock)).toThrow(
      new Error(`There is no mock for ${InjectableDirective.name}`),
    );
  });

  it('rejects earlier mocks when the current builder excludes the declarations', async () => {
    const cachedPlain = MockDirective(PlainDirective);
    const cachedInjectable = MockDirective(InjectableDirective);

    await MockBuilder()
      .exclude(PlainDirective)
      .exclude(InjectableDirective);

    expect(() => getMockedNgDefOf(PlainDirective, 'd')).toThrow(
      new Error(`There is no mock for ${PlainDirective.name}`),
    );
    expect(() => getMockedNgDefOf(PlainDirective)).toThrow(
      new Error(`There is no mock for ${PlainDirective.name}`),
    );
    expect(() => getMockedNgDefOf(InjectableDirective, 'd')).toThrow(
      new Error(`There is no mock for ${InjectableDirective.name}`),
    );
    expect(() => getMockedNgDefOf(InjectableDirective)).toThrow(
      new Error(`There is no mock for ${InjectableDirective.name}`),
    );
    expect(() => getMockedNgDefOf(cachedPlain, 'd')).toThrow(
      new Error(`There is no mock for ${PlainDirective.name}`),
    );
    expect(() => getMockedNgDefOf(cachedPlain)).toThrow(
      new Error(`There is no mock for ${PlainDirective.name}`),
    );
    expect(() => getMockedNgDefOf(cachedInjectable, 'd')).toThrow(
      new Error(`There is no mock for ${InjectableDirective.name}`),
    );
    expect(() => getMockedNgDefOf(cachedInjectable)).toThrow(
      new Error(`There is no mock for ${InjectableDirective.name}`),
    );
  });

  it('prefers current builder mocks over earlier cached declarations', async () => {
    const cachedPlain = MockDirective(PlainDirective);
    const cachedInjectable = MockDirective(InjectableDirective);
    const metadata = MockBuilder()
      .mock(PlainDirective)
      .mock(InjectableDirective)
      .build();
    const plainMocks = metadata.declarations!.filter(declaration =>
      isMockedNgDefOf(declaration, PlainDirective, 'd'),
    );
    const injectableMocks = metadata.declarations!.filter(
      declaration =>
        isMockedNgDefOf(declaration, InjectableDirective, 'd'),
    );
    expect(plainMocks.length).toBeGreaterThan(0);
    expect(injectableMocks.length).toBeGreaterThan(0);
    const plainMock = plainMocks[0];
    const injectableMock = injectableMocks[0];
    await TestBed.configureTestingModule(
      metadata,
    ).compileComponents();

    expect(plainMock).toBeDefined();
    expect(injectableMock).toBeDefined();
    expect(plainMock).not.toBe(cachedPlain);
    expect(injectableMock).not.toBe(cachedInjectable);
    expect(plainMock).toBe(getMockedNgDefOf(PlainDirective, 'd'));
    expect(plainMock).toBe(getMockedNgDefOf(PlainDirective));
    expect(injectableMock).toBe(
      getMockedNgDefOf(InjectableDirective, 'd'),
    );
    expect(injectableMock).toBe(
      getMockedNgDefOf(InjectableDirective),
    );
  });
});
