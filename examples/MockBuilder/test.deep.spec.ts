import { HttpBackend, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

import {
  ContentChildComponent,
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
  MyDirective,
} from './spec.directives.fixtures';
import {
  ModuleKeep,
  ModuleMock,
  MyModule,
} from './spec.modules.fixtures';
import {
  CustomizePipe,
  KeepPipe,
  MockPipe,
  MyPipe,
  RestorePipe,
} from './spec.pipes.fixtures';
import {
  AnythingKeep1,
  AnythingKeep2,
  MyCustomProvider1,
  MyCustomProvider2,
  MyCustomProvider3,
  MyService1,
  MyService2,
  ServiceCustomize,
  ServiceKeep,
  ServiceMock,
  TheSameAsAnyProvider,
} from './spec.services.fixtures';
import {
  TOKEN_CUSTOMIZE,
  TOKEN_KEEP,
  TOKEN_MOCK,
} from './spec.tokens.fixtures';

describe('MockBuilder:deep', () => {
  beforeEach(async () => {
    const ngModule = MockBuilder(MyComponent, MyModule)
      .mock(ContentChildComponent, {
        render: {
          block: {
            $implicit: '-$implicit-',
            variables: { a: { z: 'b' } },
          },
        },
      })

      .keep(ModuleKeep, {
        dependency: true,
      })
      .keep(KeepComponent, {
        dependency: true,
      })
      .keep(KeepDirective, {
        dependency: true,
      })
      .keep(KeepPipe, {
        dependency: true,
      })
      .keep(ServiceKeep)
      .keep(TOKEN_KEEP)

      // The same can be done with Components, Directives and Pipes.
      // For Providers use .provider() or .mock().
      .replace(HttpClientModule, HttpClientTestingModule, {
        dependency: true,
      })

      .mock(ModuleMock, {
        dependency: true,
      })
      .mock(MockComponent, {
        dependency: true,
      })
      .mock(MockDirective, {
        dependency: true,
        render: {
          $implicit: { a: '$' },
          variables: { a: { b: 'b' } },
        },
      })
      .mock(MockPipe, {
        dependency: true,
      })
      .mock(ServiceMock) // makes all methods an empty function
      .mock(TOKEN_MOCK) // makes its value undefined

      .mock(CustomizePipe, () => 'My Custom Result')
      .mock(RestorePipe, () => 'My Restored Pipe')
      .mock(ServiceCustomize, {
        getName: () => 'My Customized String',
      })
      .mock(TOKEN_CUSTOMIZE, 'My_Token')

      // All providers will be set into the TestModule.
      .provide({
        provide: AnythingKeep1,
        useValue: new TheSameAsAnyProvider(),
      })
      .provide({
        provide: AnythingKeep2,
        useFactory: () => new TheSameAsAnyProvider(),
      })
      .provide(MyCustomProvider1)
      .provide([MyCustomProvider2, MyCustomProvider3])

      // Now the pipe will not be replaced with its mock copy.
      .keep(RestorePipe)

      // Extra configuration.
      .keep(MyDirective)
      .keep(MyPipe)
      .mock(MyService1)
      .keep(MyService2)

      // Even it belongs to the module that is marked as kept,
      // the component will be replaced with its mock copy.
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

  it('should render', () => {
    const fixture = MockRender(MyComponent);
    expect(fixture).toBeDefined();
    const content = fixture.nativeElement.innerHTML.replace(
      new RegExp('<!--(.|\\n|\\r)*?-->|<!--(.|\\n|\\r)*', 'mg'),
      '',
    );
    expect(content).toContain('<div>My Content</div>');

    expect(content).toContain(
      '<div>MyComponent1: <c-1>If we need to tune testBed</c-1></div>',
    );
    expect(content).toContain(
      '<div>MyComponent2: <c-2>More callbacks</c-2></div>',
    );
    expect(content).toContain('<div>MyComponent3: <c-3></c-3></div>');
    expect(content).toContain(
      '<div>KeepComponent: <c-keep>KeepComponent</c-keep></div>',
    );
    expect(content).toContain(
      '<div>MockComponent: <c-mock></c-mock></div>',
    );
    expect(content).toContain(
      '<div>ComponentStructural: -$implicit- b</div>',
    );

    expect(content).toContain(
      '<div>MyDirective: <d-my></d-my></div>',
    );
    expect(content).toContain(
      '<div>KeepDirective: <d-keep></d-keep></div>',
    );
    expect(content).toContain(
      'MockDirective 1: <span>render b</span>',
    );
    expect(content).toContain('MockDirective 2: render $');

    expect(content).toContain('<div>MyPipe: MyPipe:text:0</div>');
    expect(content).toContain('<div>KeepPipe: KeepPipe:text:0</div>');
    expect(content).toContain('<div>MockPipe: </div>');
    expect(content).toContain(
      '<div>CustomizePipe: My Custom Result</div>',
    );
    expect(content).toContain(
      '<div>RestorePipe: RestorePipe:text:0</div>',
    );

    expect(content).toContain('<div>TOKEN_KEEP: TOKEN_KEEP</div>');
    expect(content).toContain('<div>TOKEN_MOCK: </div>');
    expect(content).toContain('<div>TOKEN_CUSTOMIZE: My_Token</div>');

    expect(content).toContain(
      '<div>AnythingKeep1: TheSameAsAnyProvider</div>',
    );
    expect(content).toContain(
      '<div>AnythingKeep2: TheSameAsAnyProvider</div>',
    );
    expect(content).toContain(
      '<div>myCustomProvider1: MyCustomProvider1</div>',
    );
    expect(content).toContain(
      '<div>myCustomProvider2: MyCustomProvider2</div>',
    );
    expect(content).toContain(
      '<div>myCustomProvider3: MyCustomProvider3</div>',
    );

    expect(content).toContain('<div>myService1: </div>');
    expect(content).toContain('<div>myService2: MyService2</div>');
    expect(content).toContain('<div>serviceKeep: serviceKeep</div>');
    expect(content).toContain(
      '<div>serviceCustomize: My Customized String</div>',
    );
    expect(content).toContain('<div>serviceMock: </div>');
  });

  it('replaces HttpBackend', inject(
    [HttpBackend],
    (httpBackend: HttpBackend) => {
      // Checking that replacement works.
      expect(httpBackend.constructor).toBeDefined();
      expect(httpBackend.constructor.name).toMatch(
        /_?HttpClientTestingBackend$/,
      );
    },
  ));
});
