import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { isMockedNgDefOf, MockBuilder, NG_MOCKS } from 'ng-mocks';

import {
  KeepComponent,
  MockComponent,
  My1Component,
  My2Component,
  My3Component,
  MyComponent,
} from './spec.components.fixtures';
import {
  KeepDirective,
  MockDirective,
} from './spec.directives.fixtures';
import {
  ModuleKeep,
  ModuleMock,
  MyModule,
} from './spec.modules.fixtures';
import {
  KeepPipe,
  MockPipe,
  RestorePipe,
} from './spec.pipes.fixtures';
import {
  ServiceCustomize,
  ServiceKeep,
  ServiceMock,
} from './spec.services.fixtures';
import {
  TOKEN_CUSTOMIZE,
  TOKEN_KEEP,
  TOKEN_MOCK,
} from './spec.tokens.fixtures';

describe('MockBuilder:ngMocks', () => {
  beforeEach(async () => {
    const ngModule = MockBuilder(MyComponent, MyModule)
      .keep(ModuleKeep)
      .keep(KeepComponent)
      .keep(KeepDirective)
      .keep(KeepPipe)
      .keep(ServiceKeep)
      .keep(TOKEN_KEEP)

      .replace(HttpClientModule, HttpClientTestingModule)

      .mock(ModuleMock)
      .mock(MockComponent)
      .mock(MockDirective)
      .mock(MockPipe)
      .mock(ServiceMock) // makes all methods an empty function
      .mock(TOKEN_MOCK) // makes its value undefined

      .mock(ServiceCustomize, {
        getName: () => 'My Customized String',
      })
      .mock(TOKEN_CUSTOMIZE, 'My_Token')

      // Now the pipe will not be replaced with its mock copy.
      .keep(RestorePipe)

      // Even it belongs to the module we want to keep,
      // it will be still replaced with a mock copy.
      .mock(My3Component)

      // and now we want to build our NgModule.
      .build();
    TestBed.configureTestingModule(ngModule);

    // Extra configuration
    TestBed.overrideTemplate(
      My1Component,
      'If we need to tune testBed',
    );
    TestBed.overrideTemplate(My2Component, 'More callbacks');

    return TestBed.compileComponents();
  });

  it('should contain mocks', inject(
    [NG_MOCKS],
    (mocks: Map<any, any>) => {
      // main part
      const myComponent = mocks.get(MyComponent);
      expect(myComponent).toBe(MyComponent);
      const myModule = mocks.get(MyModule);
      expect(isMockedNgDefOf(myModule, MyModule, 'm')).toBeTruthy();

      // keep
      const keepComponent = mocks.get(KeepComponent);
      expect(keepComponent).toBe(keepComponent);
      const keepDirective = mocks.get(KeepDirective);
      expect(keepDirective).toBe(keepDirective);
      const keepPipe = mocks.get(KeepPipe);
      expect(keepPipe).toBe(keepPipe);
      const serviceKeep = mocks.get(ServiceKeep);
      expect(serviceKeep).toBe(ServiceKeep);
      const tokenKeep = mocks.get(TOKEN_KEEP);
      expect(tokenKeep).toBe(TOKEN_KEEP);

      // replace
      const httpClientModule = mocks.get(HttpClientModule);
      expect(httpClientModule).toBe(HttpClientTestingModule);

      // mimic
      const moduleMock = mocks.get(ModuleMock);
      expect(
        isMockedNgDefOf(moduleMock, ModuleMock, 'm'),
      ).toBeTruthy();
      const mockComponent = mocks.get(MockComponent);
      expect(
        isMockedNgDefOf(mockComponent, MockComponent, 'c'),
      ).toBeTruthy();
      const mockDirective = mocks.get(MockDirective);
      expect(
        isMockedNgDefOf(mockDirective, MockDirective, 'd'),
      ).toBeTruthy();
      const mockPipe = mocks.get(MockPipe);
      expect(isMockedNgDefOf(mockPipe, MockPipe, 'p')).toBeTruthy();
      const serviceMock = mocks.get(ServiceMock);
      expect(serviceMock).toBeDefined();
      expect(serviceMock.useFactory).toBeDefined();
      const serviceMockInstance = serviceMock.useFactory();
      expect(serviceMockInstance.getName).toBeDefined();
      expect(serviceMockInstance.getName()).toBeUndefined();
      expect(mocks.has(TOKEN_MOCK)).toBeDefined();
      expect(mocks.get(TOKEN_MOCK)).toBeDefined();

      // customize
      const serviceCustomize = mocks.get(ServiceCustomize);
      expect(serviceCustomize).toBeDefined();
      expect(serviceCustomize.useFactory).toBeDefined();
      const serviceCustomizeInstance = serviceCustomize.useFactory();
      expect(serviceCustomizeInstance.getName).toBeDefined();
      expect(serviceCustomizeInstance.getName()).toEqual(
        'My Customized String',
      );
      const tokenCustomize = mocks.get(TOKEN_CUSTOMIZE);
      expect(tokenCustomize).toBeDefined();
      expect(tokenCustomize.useFactory).toBeDefined();
      const tokenCustomizeValue = tokenCustomize.useFactory();
      expect(tokenCustomizeValue).toEqual('My_Token');

      // restore
      const restorePipe = mocks.get(RestorePipe);
      expect(restorePipe).toBe(restorePipe);

      // mock nested
      const myComponent3 = mocks.get(My3Component);
      expect(
        isMockedNgDefOf(myComponent3, My3Component, 'c'),
      ).toBeTruthy();
    },
  ));
});
