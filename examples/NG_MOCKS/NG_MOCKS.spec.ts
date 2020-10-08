import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { isMockedNgDefOf, MockBuilder, NG_MOCKS } from 'ng-mocks';

import {
  ComponentWeDontWantToMock,
  ComponentWeWantToMock,
  MyComponent,
  MyComponent1,
  MyComponent2,
  MyComponent3,
} from './fixtures.components';
import { DirectiveWeDontWantToMock, DirectiveWeWantToMock } from './fixtures.directives';
import { ModuleWeDontWantToMock, ModuleWeWantToMockBesidesMyModule, MyModule } from './fixtures.modules';
import { PipeWeDontWantToMock, PipeWeWantToMock, PipeWeWantToRestore } from './fixtures.pipes';
import { ServiceWeDontWantToMock, ServiceWeWantToCustomize, ServiceWeWantToMock } from './fixtures.services';
import {
  INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK,
  INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
  INJECTION_TOKEN_WE_WANT_TO_MOCK,
} from './fixtures.tokens';

describe('NG_MOCKS:deep', () => {
  beforeEach(async () => {
    const ngModule = MockBuilder(MyComponent, MyModule)
      .keep(ModuleWeDontWantToMock)
      .keep(ComponentWeDontWantToMock)
      .keep(DirectiveWeDontWantToMock)
      .keep(PipeWeDontWantToMock)
      .keep(ServiceWeDontWantToMock)
      .keep(INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK)

      .replace(HttpClientModule, HttpClientTestingModule)

      .mock(ModuleWeWantToMockBesidesMyModule)
      .mock(ComponentWeWantToMock)
      .mock(DirectiveWeWantToMock)
      .mock(PipeWeWantToMock)
      .mock(ServiceWeWantToMock) // makes all methods an empty function
      .mock(INJECTION_TOKEN_WE_WANT_TO_MOCK) // makes its value undefined

      .mock(ServiceWeWantToCustomize, { getName: () => 'My Customized String' })
      .mock(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE, 'My_Token')

      // Now the pipe won't be mocked.
      .keep(PipeWeWantToRestore)

      // Even it belongs to the module to keep it still will be mocked and replaced.
      .mock(MyComponent3)

      // and now we want to build our NgModule.
      .build();
    TestBed.configureTestingModule(ngModule);

    // Extra configuration
    TestBed.overrideTemplate(MyComponent1, 'If we need to tune testBed');
    TestBed.overrideTemplate(MyComponent2, 'More callbacks');

    return TestBed.compileComponents();
  });

  it('should contain mocks', inject([NG_MOCKS], (mocks: Map<any, any>) => {
    // main part
    const myComponent = mocks.get(MyComponent);
    expect(myComponent).toBe(MyComponent);
    const myModule = mocks.get(MyModule);
    expect(isMockedNgDefOf(myModule, MyModule, 'm')).toBeTruthy();

    // keep
    const componentWeDontWantToMock = mocks.get(ComponentWeDontWantToMock);
    expect(componentWeDontWantToMock).toBe(ComponentWeDontWantToMock);
    const directiveWeDontWantToMock = mocks.get(DirectiveWeDontWantToMock);
    expect(directiveWeDontWantToMock).toBe(DirectiveWeDontWantToMock);
    const pipeWeDontWantToMock = mocks.get(PipeWeDontWantToMock);
    expect(pipeWeDontWantToMock).toBe(PipeWeDontWantToMock);
    const serviceWeDontWantToMock = mocks.get(ServiceWeDontWantToMock);
    expect(serviceWeDontWantToMock).toBe(ServiceWeDontWantToMock);
    const injectionTokenWeDontWantToMock = mocks.get(INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK);
    expect(injectionTokenWeDontWantToMock).toBe(INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK);

    // replace
    const httpClientModule = mocks.get(HttpClientModule);
    expect(httpClientModule).toBe(HttpClientTestingModule);

    // mock
    const moduleWeWantToMockBesidesMyModule = mocks.get(ModuleWeWantToMockBesidesMyModule);
    expect(isMockedNgDefOf(moduleWeWantToMockBesidesMyModule, ModuleWeWantToMockBesidesMyModule, 'm')).toBeTruthy();
    const componentWeWantToMock = mocks.get(ComponentWeWantToMock);
    expect(isMockedNgDefOf(componentWeWantToMock, ComponentWeWantToMock, 'c')).toBeTruthy();
    const directiveWeWantToMock = mocks.get(DirectiveWeWantToMock);
    expect(isMockedNgDefOf(directiveWeWantToMock, DirectiveWeWantToMock, 'd')).toBeTruthy();
    const pipeWeWantToMock = mocks.get(PipeWeWantToMock);
    expect(isMockedNgDefOf(pipeWeWantToMock, PipeWeWantToMock, 'p')).toBeTruthy();
    const serviceWeWantToMock = mocks.get(ServiceWeWantToMock);
    expect(serviceWeWantToMock).toBeDefined();
    expect(serviceWeWantToMock.useFactory).toBeDefined();
    const serviceWeWantToMockInstance = serviceWeWantToMock.useFactory();
    expect(serviceWeWantToMockInstance.getName).toBeDefined();
    expect(serviceWeWantToMockInstance.getName()).toBeUndefined();
    expect(mocks.has(INJECTION_TOKEN_WE_WANT_TO_MOCK)).toBeDefined();
    expect(mocks.get(INJECTION_TOKEN_WE_WANT_TO_MOCK)).toBeUndefined();

    // customize
    const serviceWeWantToCustomize = mocks.get(ServiceWeWantToCustomize);
    expect(serviceWeWantToCustomize).toBeDefined();
    expect(serviceWeWantToCustomize.useFactory).toBeDefined();
    const serviceWeWantToCustomizeInstance = serviceWeWantToCustomize.useFactory();
    expect(serviceWeWantToCustomizeInstance.getName).toBeDefined();
    expect(serviceWeWantToCustomizeInstance.getName()).toEqual('My Customized String');
    const injectionTokenWeWantToCustomize = mocks.get(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE);
    expect(injectionTokenWeWantToCustomize).toBeDefined();
    expect(injectionTokenWeWantToCustomize.useFactory).toBeDefined();
    const injectionTokenWeWantToCustomizeInstance = injectionTokenWeWantToCustomize.useFactory();
    expect(injectionTokenWeWantToCustomizeInstance).toEqual('My_Token');

    // restore
    const pipeWeWantToRestore = mocks.get(PipeWeWantToRestore);
    expect(pipeWeWantToRestore).toBe(PipeWeWantToRestore);

    // mock nested
    const myComponent3 = mocks.get(MyComponent3);
    expect(isMockedNgDefOf(myComponent3, MyComponent3, 'c')).toBeTruthy();
  }));
});
