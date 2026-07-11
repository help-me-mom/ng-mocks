import { Optional } from '@angular/core';

import { NG_MOCKS } from '../../common/core.tokens';

import {
  createEntryComponentsModuleParameters,
  EntryComponentsModule,
} from './handle-entry-components';

describe('handle-entry-components', () => {
  it('patches legacy component factory resolvers', () => {
    class SourceComponent {}
    class MockComponent {}
    class OtherComponent {}
    const resolveComponentFactory = jasmine
      .createSpy('resolveComponentFactory')
      .and.callFake(component => component);
    const componentFactoryResolver = { resolveComponentFactory };

    new EntryComponentsModule(
      new Map([[SourceComponent, MockComponent]]),
      componentFactoryResolver,
    );

    expect(
      componentFactoryResolver.resolveComponentFactory(
        SourceComponent,
      ),
    ).toBe(MockComponent);
    expect(
      componentFactoryResolver.resolveComponentFactory(
        OtherComponent,
      ),
    ).toBe(OtherComponent);
    expect(resolveComponentFactory).toHaveBeenCalledWith(
      MockComponent,
    );
    expect(resolveComponentFactory).toHaveBeenCalledWith(
      OtherComponent,
    );
  });

  it('builds dependency metadata with an available legacy resolver', () => {
    class ComponentFactoryResolver {
      public resolveComponentFactory(component: unknown): unknown {
        return component;
      }
    }

    const parameters = createEntryComponentsModuleParameters(
      ComponentFactoryResolver,
    );

    expect(parameters[0]).toEqual([NG_MOCKS]);
    expect(parameters[1][0]).toBe(ComponentFactoryResolver);
    expect(parameters[1][1]).toEqual(jasmine.any(Optional));
  });

  it('builds dependency metadata without a removed legacy resolver', () => {
    expect(createEntryComponentsModuleParameters(undefined)).toEqual([
      [NG_MOCKS],
    ]);
  });
});
