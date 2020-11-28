import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { isMockedNgDefOf, MockBuilder, NG_MOCKS } from 'ng-mocks';

import {
  ComponentWeDontWantToMimic,
  ComponentWeWantToMimic,
  MyComponent,
  MyComponent1,
  MyComponent2,
  MyComponent3,
} from './fixtures.components';
import {
  DirectiveWeDontWantToMimic,
  DirectiveWeWantToMimic,
} from './fixtures.directives';
import {
  ModuleWeDontWantToMimic,
  ModuleWeWantToMimicBesidesMyModule,
  MyModule,
} from './fixtures.modules';
import {
  PipeWeWantToRestore,
  WeDontWantToMimicPipe,
  WeWantToMimicPipe,
} from './fixtures.pipes';
import {
  ServiceWeDontWantToMimic,
  ServiceWeWantToCustomize,
  ServiceWeWantToMimic,
} from './fixtures.services';
import {
  INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC,
  INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
  INJECTION_TOKEN_WE_WANT_TO_MIMIC,
} from './fixtures.tokens';

describe('NG_MOCKS:deep', () => {
  beforeEach(async () => {
    const ngModule = MockBuilder(MyComponent, MyModule)
      .keep(ModuleWeDontWantToMimic)
      .keep(ComponentWeDontWantToMimic)
      .keep(DirectiveWeDontWantToMimic)
      .keep(WeDontWantToMimicPipe)
      .keep(ServiceWeDontWantToMimic)
      .keep(INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC)

      .replace(HttpClientModule, HttpClientTestingModule)

      .mock(ModuleWeWantToMimicBesidesMyModule)
      .mock(ComponentWeWantToMimic)
      .mock(DirectiveWeWantToMimic)
      .mock(WeWantToMimicPipe)
      .mock(ServiceWeWantToMimic) // makes all methods an empty function
      .mock(INJECTION_TOKEN_WE_WANT_TO_MIMIC) // makes its value undefined

      .mock(ServiceWeWantToCustomize, {
        getName: () => 'My Customized String',
      })
      .mock(INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE, 'My_Token')

      // Now the pipe won't be replaced with its mock copy.
      .keep(PipeWeWantToRestore)

      // Even it belongs to the module we want to keep,
      // it will be still replaced with a mock copy.
      .mock(MyComponent3)

      // and now we want to build our NgModule.
      .build();
    TestBed.configureTestingModule(ngModule);

    // Extra configuration
    TestBed.overrideTemplate(
      MyComponent1,
      'If we need to tune testBed',
    );
    TestBed.overrideTemplate(MyComponent2, 'More callbacks');

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
      const componentWeDontWantToMimic = mocks.get(
        ComponentWeDontWantToMimic,
      );
      expect(componentWeDontWantToMimic).toBe(
        ComponentWeDontWantToMimic,
      );
      const directiveWeDontWantToMimic = mocks.get(
        DirectiveWeDontWantToMimic,
      );
      expect(directiveWeDontWantToMimic).toBe(
        DirectiveWeDontWantToMimic,
      );
      const pipeWeDontWantToMimic = mocks.get(WeDontWantToMimicPipe);
      expect(pipeWeDontWantToMimic).toBe(WeDontWantToMimicPipe);
      const serviceWeDontWantToMimic = mocks.get(
        ServiceWeDontWantToMimic,
      );
      expect(serviceWeDontWantToMimic).toBe(ServiceWeDontWantToMimic);
      const injectionTokenWeDontWantToMimic = mocks.get(
        INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC,
      );
      expect(injectionTokenWeDontWantToMimic).toBe(
        INJECTION_TOKEN_WE_DONT_WANT_TO_MIMIC,
      );

      // replace
      const httpClientModule = mocks.get(HttpClientModule);
      expect(httpClientModule).toBe(HttpClientTestingModule);

      // mimic
      const moduleWeWantToMimicBesidesMyModule = mocks.get(
        ModuleWeWantToMimicBesidesMyModule,
      );
      expect(
        isMockedNgDefOf(
          moduleWeWantToMimicBesidesMyModule,
          ModuleWeWantToMimicBesidesMyModule,
          'm',
        ),
      ).toBeTruthy();
      const componentWeWantToMimic = mocks.get(
        ComponentWeWantToMimic,
      );
      expect(
        isMockedNgDefOf(
          componentWeWantToMimic,
          ComponentWeWantToMimic,
          'c',
        ),
      ).toBeTruthy();
      const directiveWeWantToMimic = mocks.get(
        DirectiveWeWantToMimic,
      );
      expect(
        isMockedNgDefOf(
          directiveWeWantToMimic,
          DirectiveWeWantToMimic,
          'd',
        ),
      ).toBeTruthy();
      const pipeWeWantToMimic = mocks.get(WeWantToMimicPipe);
      expect(
        isMockedNgDefOf(pipeWeWantToMimic, WeWantToMimicPipe, 'p'),
      ).toBeTruthy();
      const serviceWeWantToMimic = mocks.get(ServiceWeWantToMimic);
      expect(serviceWeWantToMimic).toBeDefined();
      expect(serviceWeWantToMimic.useFactory).toBeDefined();
      const serviceWeWantToMimicInstance = serviceWeWantToMimic.useFactory();
      expect(serviceWeWantToMimicInstance.getName).toBeDefined();
      expect(serviceWeWantToMimicInstance.getName()).toBeUndefined();
      expect(
        mocks.has(INJECTION_TOKEN_WE_WANT_TO_MIMIC),
      ).toBeDefined();
      expect(
        mocks.get(INJECTION_TOKEN_WE_WANT_TO_MIMIC),
      ).toBeUndefined();

      // customize
      const serviceWeWantToCustomize = mocks.get(
        ServiceWeWantToCustomize,
      );
      expect(serviceWeWantToCustomize).toBeDefined();
      expect(serviceWeWantToCustomize.useFactory).toBeDefined();
      const serviceWeWantToCustomizeInstance = serviceWeWantToCustomize.useFactory();
      expect(serviceWeWantToCustomizeInstance.getName).toBeDefined();
      expect(serviceWeWantToCustomizeInstance.getName()).toEqual(
        'My Customized String',
      );
      const injectionTokenWeWantToCustomize = mocks.get(
        INJECTION_TOKEN_WE_WANT_TO_CUSTOMIZE,
      );
      expect(injectionTokenWeWantToCustomize).toBeDefined();
      expect(
        injectionTokenWeWantToCustomize.useFactory,
      ).toBeDefined();
      const injectionTokenWeWantToCustomizeInstance = injectionTokenWeWantToCustomize.useFactory();
      expect(injectionTokenWeWantToCustomizeInstance).toEqual(
        'My_Token',
      );

      // restore
      const pipeWeWantToRestore = mocks.get(PipeWeWantToRestore);
      expect(pipeWeWantToRestore).toBe(PipeWeWantToRestore);

      // mimicked nested
      const myComponent3 = mocks.get(MyComponent3);
      expect(
        isMockedNgDefOf(myComponent3, MyComponent3, 'c'),
      ).toBeTruthy();
    },
  ));
});
