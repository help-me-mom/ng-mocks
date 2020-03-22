import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import {
  isMockedNgDefOf,
  MockBuilder,
  NG_MOCKS,
} from 'ng-mocks';

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

      .mock(ServiceWeWantToCustomize, {prop1: true, getName: () => 'My Customized String'})
      .mock(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE, 'My_Token')

      // Now the pipe won't be mocked.
      .keep(PipeWeWantToRestore)

      // Even it belongs to the module to keep it still will be mocked and replaced.
      .mock(MyComponent3)

      // and now we want to build our NgModule.
      .build()
    ;

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
    expect(isMockedNgDefOf(myModule, MyModule, 'm')).toBeTruthy('myModule');

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
    expect(isMockedNgDefOf(moduleWeWantToMockBesidesMyModule, ModuleWeWantToMockBesidesMyModule, 'm'))
      .toBeTruthy('moduleWeWantToMockBesidesMyModule');
    const componentWeWantToMock = mocks.get(ComponentWeWantToMock);
    expect(isMockedNgDefOf(componentWeWantToMock, ComponentWeWantToMock, 'c')).toBeTruthy('componentWeWantToMock');
    const directiveWeWantToMock = mocks.get(DirectiveWeWantToMock);
    expect(isMockedNgDefOf(directiveWeWantToMock, DirectiveWeWantToMock, 'd')).toBeTruthy('directiveWeWantToMock');
    const pipeWeWantToMock = mocks.get(PipeWeWantToMock);
    expect(isMockedNgDefOf(pipeWeWantToMock, PipeWeWantToMock, 'p')).toBeTruthy('pipeWeWantToMock');
    const serviceWeWantToMock = mocks.get(ServiceWeWantToMock);
    expect(serviceWeWantToMock).toBeDefined('serviceWeWantToMock');
    expect(serviceWeWantToMock.useValue).toBeDefined('serviceWeWantToMock.useValue');
    expect(serviceWeWantToMock.useValue.getName).toBeDefined('serviceWeWantToMock.getName');
    expect(serviceWeWantToMock.useValue.getName()).toBeUndefined('serviceWeWantToMock.getName()');
    const injectionTokenWeWantToMock = mocks.get(INJECTION_TOKEN_WE_WANT_TO_MOCK);
    expect(injectionTokenWeWantToMock).toBeDefined('injectionTokenWeWantToMock');
    expect(injectionTokenWeWantToMock.useValue).toBeUndefined('injectionTokenWeWantToMock.useValue');

    // customize
    const serviceWeWantToCustomize = mocks.get(ServiceWeWantToCustomize);
    expect(serviceWeWantToCustomize).toBeDefined('serviceWeWantToCustomize');
    expect(serviceWeWantToCustomize.useValue).toBeDefined('serviceWeWantToCustomize.useValue');
    expect(serviceWeWantToCustomize.useValue.getName).toBeDefined('serviceWeWantToCustomize.getName');
    expect(serviceWeWantToCustomize.useValue.getName())
      .toEqual('My Customized String', 'serviceWeWantToCustomize.getName()');
    expect(serviceWeWantToCustomize.useValue.prop1).toEqual(true, 'serviceWeWantToCustomize.prop1');
    const injectionTokenWeWantToCustomize = mocks.get(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE);
    expect(injectionTokenWeWantToCustomize).toBeDefined('injectionTokenWeWantToCustomize');
    expect(injectionTokenWeWantToCustomize.useValue).toEqual('My_Token', 'injectionTokenWeWantToCustomize.useValue');

    // restore
    const pipeWeWantToRestore = mocks.get(PipeWeWantToRestore);
    expect(pipeWeWantToRestore).toBe(PipeWeWantToRestore);

    // mock nested
    const myComponent3 = mocks.get(MyComponent3);
    expect(isMockedNgDefOf(myComponent3, MyComponent3, 'c')).toBeTruthy('myComponent3');
  }));
});
