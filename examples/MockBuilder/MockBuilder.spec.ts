import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import {
  ComponentContentChild,
  ComponentWeDontWantToMock,
  ComponentWeWantToMock,
  MyComponent,
  MyComponent1,
  MyComponent2,
  MyComponent3,
} from './fixtures.components';
import { DirectiveWeDontWantToMock, DirectiveWeWantToMock, MyDirective } from './fixtures.directives';
import { ModuleWeDontWantToMock, ModuleWeWantToMockBesidesMyModule, MyModule } from './fixtures.modules';
import {
  MyPipe,
  PipeWeDontWantToMock,
  PipeWeWantToCustomize,
  PipeWeWantToMock,
  PipeWeWantToRestore,
} from './fixtures.pipes';
import {
  AnythingWeWant1,
  AnythingWeWant2,
  MyCustomProvider1,
  MyCustomProvider2,
  MyCustomProvider3,
  MyService1,
  MyService2,
  ServiceWeDontWantToMock,
  ServiceWeWantToCustomize,
  ServiceWeWantToMock,
  TheSameAsAnyProvider,
} from './fixtures.services';
import {
  INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK,
  INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
  INJECTION_TOKEN_WE_WANT_TO_MOCK,
} from './fixtures.tokens';

describe('MockBuilder:simple', () => {
  beforeEach(async () => {
    const ngModule = MockBuilder(MyComponent, MyModule)
      // mocking configuration here
      .build();

    // now ngModule is
    // {
    //   imports: [MockModule(MyModule)], // but MyComponent wasn't mocked for the testing purposes.
    // }
    // and we can simply pass it to the TestBed.
    return TestBed.configureTestingModule(ngModule).compileComponents();
  });

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('<div>My Content</div>');
  });
});

describe('MockBuilder:deep', () => {
  beforeEach(async () => {
    const ngModule = MockBuilder(MyComponent, MyModule)

      .mock(ComponentContentChild, {
        render: {
          block: {
            $implicit: '-$implicit-',
            variables: {a: {z: 'b'}},
          },
        },
      })

      .keep(ModuleWeDontWantToMock, {
        dependency: true,
      })
      .keep(ComponentWeDontWantToMock, {
        dependency: true,
      })
      .keep(DirectiveWeDontWantToMock, {
        dependency: true,
      })
      .keep(PipeWeDontWantToMock, {
        dependency: true,
      })
      .keep(ServiceWeDontWantToMock)
      .keep(INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK)

      // The same can be done with Components, Directives and Pipes.
      // For Providers use .provider() or .mock().
      .replace(HttpClientModule, HttpClientTestingModule, {
        dependency: true,
      })

      .mock(ModuleWeWantToMockBesidesMyModule, {
        dependency: true,
      })
      .mock(ComponentWeWantToMock, {
        dependency: true,
      })
      .mock(DirectiveWeWantToMock, {
        dependency: true,
        render: {
          $implicit: {a: '$'},
          variables: {a: {b: 'b'}
        },
      }})
      .mock(PipeWeWantToMock, {
        dependency: true,
      })
      .mock(ServiceWeWantToMock) // makes all methods an empty function
      .mock(INJECTION_TOKEN_WE_WANT_TO_MOCK) // makes its value undefined

      .mock(PipeWeWantToCustomize, (value) => 'My Custom Result')
      .mock(PipeWeWantToRestore, (value) => 'My Restored Pipe')
      .mock(ServiceWeWantToCustomize, {prop1: true, getName: () => 'My Customized String'})
      .mock(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE, 'My_Token')

      // All providers will be set into the TestModule.
      .provide({
        provide: AnythingWeWant1,
        useValue: new TheSameAsAnyProvider(),
      })
      .provide({
        provide: AnythingWeWant2,
        useFactory: () => new TheSameAsAnyProvider(),
      })
      .provide(MyCustomProvider1)
      .provide([MyCustomProvider2, MyCustomProvider3])

      // Now the pipe won't be mocked.
      .keep(PipeWeWantToRestore)

      // Extra configuration.
      .keep(MyDirective)
      .keep(MyPipe)
      .mock(MyService1)
      .keep(MyService2)

      // Even it belongs to the module that is marked as kept, the component will be mocked and replaced.
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

  it('should render', inject([HttpBackend], (httpBackend: HttpBackend) => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML;
    expect(content).toContain('<div>My Content</div>');

    expect(content).toContain('<div>MyComponent1: <component-1>If we need to tune testBed</component-1></div>');
    expect(content).toContain('<div>MyComponent2: <component-2>More callbacks</component-2></div>');
    expect(content).toContain('<div>MyComponent3: <component-3></component-3></div>');
    expect(content).toContain('<div>ComponentWeDontWantToMock: <dont-want>ComponentWeDontWantToMock</dont-want></div>');
    expect(content).toContain('<div>ComponentWeWantToMock: <do-want></do-want></div>');
    expect(content).toContain('<div>ComponentStructural: -$implicit- b</div>');

    expect(content).toContain('<div>MyDirective: <mydirective></mydirective></div>');
    expect(content).toContain('<div>DirectiveWeDontWantToMock: <wedontwanttomock></wedontwanttomock></div>');
    expect(content).toContain('<div>DirectiveWeWantToMock 1: <!----><span>render b</span></div>');
    expect(content).toContain('<div>DirectiveWeWantToMock 2: <!---->render $</div>');

    expect(content).toContain('<div>MyPipe: MyPipe:text</div>');
    expect(content).toContain('<div>PipeWeDontWantToMock: PipeWeDontWantToMock:text</div>');
    expect(content).toContain('<div>PipeWeWantToMock: </div>');
    expect(content).toContain('<div>PipeWeWantToCustomize: My Custom Result</div>');
    expect(content).toContain('<div>PipeWeWantToRestore: PipeWeWantToRestore:text</div>');

    expect(content).toContain('<div>INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK: INJECTION_TOKEN_WE_DONT_WANT_TO_MOCK</div>');
    expect(content).toContain('<div>INJECTION_TOKEN_WE_WANT_TO_MOCK: </div>');
    expect(content).toContain('<div>INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE: My_Token</div>');

    expect(content).toContain('<div>anythingWeWant1: TheSameAsAnyProvider</div>');
    expect(content).toContain('<div>anythingWeWant2: TheSameAsAnyProvider</div>');
    expect(content).toContain('<div>myCustomProvider1: MyCustomProvider1</div>');
    expect(content).toContain('<div>myCustomProvider2: MyCustomProvider2</div>');
    expect(content).toContain('<div>myCustomProvider3: MyCustomProvider3</div>');

    expect(content).toContain('<div>myService1: </div>');
    expect(content).toContain('<div>myService2: MyService2</div>');
    expect(content).toContain('<div>serviceWeDontWantToMock: ServiceWeDontWantToMock</div>');
    expect(content).toContain('<div>serviceWeWantToCustomize: My Customized String</div>');
    expect(content).toContain('<div>serviceWeWantToMock: </div>');

    // Checking that replacement works.
    expect(httpBackend.constructor).toBeDefined();
    expect(httpBackend.constructor.name).toEqual('HttpClientTestingBackend');
  }));
});

describe('MockBuilder:promise', () => {
  beforeEach(() => MockBuilder()
    .keep(MyComponent1)
    .keep(MyComponent2)

    // In case if you need extra customization of TestBed in promise way.
    .beforeCompileComponents((testBed) => {
      testBed.overrideTemplate(MyComponent1, 'If we need to tune testBed');
    })
    .beforeCompileComponents((testBed) => {
      testBed.overrideTemplate(MyComponent2, 'More callbacks');
    })
  );

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender('<component-1></component-1><component-2></component-2>');
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('If we need to tune testBed');
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('More callbacks');
  });
});
