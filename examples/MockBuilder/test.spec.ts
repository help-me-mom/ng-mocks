import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

import {
  ComponentContentChild,
  ComponentWeDontWantToMimic,
  ComponentWeWantToMimic,
  MyComponent,
  MyComponent1,
  MyComponent2,
  MyComponent3,
} from './fixtures.components';
import { DirectiveWeDontWantToMimic, DirectiveWeWantToMimic, MyDirective } from './fixtures.directives';
import { ModuleWeDontWantToMimic, ModuleWeWantToMimicBesidesMyModule, MyModule } from './fixtures.modules';
import {
  MyPipe,
  PipeWeDontWantToMimicPipe,
  PipeWeWantToCustomize,
  PipeWeWantToMimicPipe,
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
  ServiceWeDontWantToMimic,
  ServiceWeWantToCustomize,
  ServiceWeWantToMimic,
  TheSameAsAnyProvider,
} from './fixtures.services';
import {
  INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC,
  INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
  INJECTION_TOKEN_WE_WANT_TO_MIMIC,
} from './fixtures.tokens';

describe('MockBuilder:simple', () => {
  beforeEach(() => MockBuilder(MyComponent, MyModule));
  // The same as
  // beforeEach(() => TestBed.configureTestingModule({{
  //   imports: [MockModule(MyModule)],
  // }).compileComponents());
  // but MyComponent has not been replaced with a mock copy for
  // the testing purposes.

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
            variables: { a: { z: 'b' } },
          },
        },
      })

      .keep(ModuleWeDontWantToMimic, {
        dependency: true,
      })
      .keep(ComponentWeDontWantToMimic, {
        dependency: true,
      })
      .keep(DirectiveWeDontWantToMimic, {
        dependency: true,
      })
      .keep(PipeWeDontWantToMimicPipe, {
        dependency: true,
      })
      .keep(ServiceWeDontWantToMimic)
      .keep(INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC)

      // The same can be done with Components, Directives and Pipes.
      // For Providers use .provider() or .mock().
      .replace(HttpClientModule, HttpClientTestingModule, {
        dependency: true,
      })

      .mock(ModuleWeWantToMimicBesidesMyModule, {
        dependency: true,
      })
      .mock(ComponentWeWantToMimic, {
        dependency: true,
      })
      .mock(DirectiveWeWantToMimic, {
        dependency: true,
        render: {
          $implicit: { a: '$' },
          variables: { a: { b: 'b' } },
        },
      })
      .mock(PipeWeWantToMimicPipe, {
        dependency: true,
      })
      .mock(ServiceWeWantToMimic) // makes all methods an empty function
      .mock(INJECTION_TOKEN_WE_WANT_TO_MIMIC) // makes its value undefined

      .mock(PipeWeWantToCustomize, () => 'My Custom Result')
      .mock(PipeWeWantToRestore, () => 'My Restored Pipe')
      .mock(ServiceWeWantToCustomize, { getName: () => 'My Customized String' })
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

      // Now the pipe won't be replaced with its mock copy.
      .keep(PipeWeWantToRestore)

      // Extra configuration.
      .keep(MyDirective)
      .keep(MyPipe)
      .mock(MyService1)
      .keep(MyService2)

      // Even it belongs to the module that is marked as kept,
      // the component will be replaced with its mock copy.
      .mock(MyComponent3)

      // and now we want to build our NgModule.
      .build();
    TestBed.configureTestingModule(ngModule);

    // Extra configuration
    TestBed.overrideTemplate(MyComponent1, 'If we need to tune testBed');
    TestBed.overrideTemplate(MyComponent2, 'More callbacks');

    return TestBed.compileComponents();
  });

  it('should render', inject([HttpBackend], (httpBackend: HttpBackend) => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    const content = fixture.debugElement.nativeElement.innerHTML.replace(/<!--.*?-->/gm, '');
    expect(content).toContain('<div>My Content</div>');

    expect(content).toContain('<div>MyComponent1: <component-1>If we need to tune testBed</component-1></div>');
    expect(content).toContain('<div>MyComponent2: <component-2>More callbacks</component-2></div>');
    expect(content).toContain('<div>MyComponent3: <component-3></component-3></div>');
    expect(content).toContain(
      '<div>ComponentWeDontWantToMimic: <dont-want>ComponentWeDontWantToMimic</dont-want></div>',
    );
    expect(content).toContain('<div>ComponentWeWantToMimic: <do-want></do-want></div>');
    expect(content).toContain('<div>ComponentStructural: -$implicit- b</div>');

    expect(content).toContain('<div>MyDirective: <mydirective></mydirective></div>');
    expect(content).toContain('<div>DirectiveWeDontWantToMimic: <wedontwanttomimic></wedontwanttomimic></div>');
    expect(content).toContain('DirectiveWeWantToMimic 1: <span>render b</span>');
    expect(content).toContain('DirectiveWeWantToMimic 2: render $');

    expect(content).toContain('<div>MyPipe: MyPipe:text:0</div>');
    expect(content).toContain('<div>PipeWeDontWantToMimic: PipeWeDontWantToMimic:text:0</div>');
    expect(content).toContain('<div>PipeWeWantToMimic: </div>');
    expect(content).toContain('<div>PipeWeWantToCustomize: My Custom Result</div>');
    expect(content).toContain('<div>PipeWeWantToRestore: PipeWeWantToRestore:text:0</div>');

    expect(content).toContain(
      '<div>INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC: INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC</div>',
    );
    expect(content).toContain('<div>INJECTION_TOKEN_WE_WANT_TO_MIMIC: </div>');
    expect(content).toContain('<div>INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE: My_Token</div>');

    expect(content).toContain('<div>anythingWeWant1: TheSameAsAnyProvider</div>');
    expect(content).toContain('<div>anythingWeWant2: TheSameAsAnyProvider</div>');
    expect(content).toContain('<div>myCustomProvider1: MyCustomProvider1</div>');
    expect(content).toContain('<div>myCustomProvider2: MyCustomProvider2</div>');
    expect(content).toContain('<div>myCustomProvider3: MyCustomProvider3</div>');

    expect(content).toContain('<div>myService1: </div>');
    expect(content).toContain('<div>myService2: MyService2</div>');
    expect(content).toContain('<div>serviceWeDontWantToMimic: ServiceWeDontWantToMimic</div>');
    expect(content).toContain('<div>serviceWeWantToCustomize: My Customized String</div>');
    expect(content).toContain('<div>serviceWeWantToMimic: </div>');

    // Checking that replacement works.
    expect(httpBackend.constructor).toBeDefined();
    expect(httpBackend.constructor.name).toEqual('HttpClientTestingBackend');
  }));
});

describe('MockBuilder:promise', () => {
  beforeEach(() =>
    MockBuilder()
      .keep(MyComponent1)
      .keep(MyComponent2)

      // In case if you need extra customization of TestBed in promise way.
      .beforeCompileComponents(testBed => {
        testBed.overrideTemplate(MyComponent1, 'If we need to tune testBed');
      })
      .beforeCompileComponents(testBed => {
        testBed.overrideTemplate(MyComponent2, 'More callbacks');
      }),
  );

  it('should render content ignoring all dependencies', () => {
    const fixture = MockRender('<component-1></component-1><component-2></component-2>');
    expect(fixture).toBeDefined();
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('If we need to tune testBed');
    expect(fixture.debugElement.nativeElement.innerHTML).toContain('More callbacks');
  });
});
