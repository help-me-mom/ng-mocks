import { Component, OnInit, Type } from '@angular/core';
import * as angularCore from '@angular/core';

import {
  getMockedNgDefOf,
  MockBuilder,
  MockRender,
  ngMocks,
} from 'ng-mocks';

type ComponentFactoryResolver = {
  resolveComponentFactory: (component: any) => unknown;
};
type ComponentFactoryResolverToken = Type<ComponentFactoryResolver>;

const componentFactoryResolverKey = 'ComponentFactory' + 'Resolver';
const ComponentFactoryResolver = (
  angularCore as unknown as Record<string, unknown>
)[componentFactoryResolverKey] as
  | ComponentFactoryResolverToken
  | undefined;

@Component({
  selector: 'modal',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'modal',
})
class ModalComponent {}

@Component({
  selector: 'target-736',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'target',
})
class TargetComponent implements OnInit {
  public constructor(
    public readonly componentFactoryResolver: ComponentFactoryResolver,
  ) {}

  public ngOnInit(): void {
    this.componentFactoryResolver.resolveComponentFactory(
      ModalComponent,
    );
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/736
if (ComponentFactoryResolver) {
  describe('issue-736', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent)
        .mock(ModalComponent)
        .provide({
          provide: ComponentFactoryResolver,
          useValue: {
            resolveComponentFactory:
              typeof jest === 'undefined'
                ? jasmine.createSpy(
                    'ComponentFactoryResolver.resolveComponentFactory',
                  )
                : jest
                    .fn()
                    .mockName(
                      'ComponentFactoryResolver.resolveComponentFactory',
                    ),
          },
        }),
    );

    it('allows to mock resolveComponentFactory', () => {
      // creating fixture without a render
      const fixture = MockRender(TargetComponent, undefined, false);

      // getting current instance of mock ComponentFactoryResolver
      const componentFactoryResolver = ngMocks.findInstance(
        ComponentFactoryResolver,
      );

      // its spied resolveComponentFactory shouldn't be called
      // the bug was that it is not a spy anymore.
      expect(
        componentFactoryResolver.resolveComponentFactory,
      ).not.toHaveBeenCalled();

      // triggering ngOnInit
      fixture.detectChanges();

      // resolveComponentFactory should have been called
      expect(
        componentFactoryResolver.resolveComponentFactory,
      ).toHaveBeenCalledWith(getMockedNgDefOf(ModalComponent));
    });
  });
}
