import {
  Component,
  Inject,
  Injectable,
  InjectionToken,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockProvider,
  MockRender,
} from 'ng-mocks';

interface ConfigInterface {
  displayName: 'first' | 'last';
}

const CONFIG = new InjectionToken<ConfigInterface>('CONFIG');

@Injectable()
class CurrentUserService {
  firstName?: string;
  lastName?: string;
}

@Component({
  selector: 'target',
  template: '{{ name }}',
})
class TargetComponent {
  // A property which will be used somewhere else: in a template or wherever.
  public name?: string;

  // Required dependencies.
  constructor(
    @Inject(CONFIG) config: ConfigInterface,
    user: CurrentUserService,
  ) {
    // Business logic in the constructor to calculate the name.
    this.name =
      config.displayName === 'first' ? user.firstName : user.lastName;
  }

  targetMockInitializationLogic() {}
}

@NgModule({
  declarations: [TargetComponent],
  providers: [
    {
      provide: CONFIG,
      useValue: {
        displayName: 'first',
      },
    },
    CurrentUserService,
  ],
})
class ItsModule {}

describe('MockInitializationLogic', () => {
  describe('TestBed', () => {
    // It is required if you cannot use default customizations.
    // https://ng-mocks.sudo.eu/extra/install#default-customizations
    // After each test it removes customizations which are done by MockInstance.
    MockInstance.scope();

    beforeEach(() => {
      // Mocks for dependencies of TargetDeclaration.
      return TestBed.configureTestingModule({
        declarations: [TargetComponent],
        providers: [
          MockProvider(CONFIG),
          MockProvider(CurrentUserService, {
            firstName: 'firstName',
            lastName: 'lastName',
          }),
        ],
      }).compileComponents();
    });

    it('covers first name', () => {
      // Customization for the use case.
      MockInstance(
        CONFIG,
        (): ConfigInterface => ({
          displayName: 'first',
        }),
      );

      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.name).toEqual('firstName');
    });

    it('covers last name', () => {
      // Customization for the use case.
      MockInstance(
        CONFIG,
        (): ConfigInterface => ({
          displayName: 'last',
        }),
      );

      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      expect(fixture.componentInstance.name).toEqual('lastName');
    });
  });

  describe('MockBuilder', () => {
    MockInstance.scope();

    beforeEach(() =>
      MockBuilder(TargetComponent, ItsModule).mock(
        CurrentUserService,
        {
          firstName: 'firstName',
          lastName: 'lastName',
        },
      ),
    );

    it('covers first name', () => {
      // Customization for the use case.
      MockInstance(
        CONFIG,
        (): ConfigInterface => ({
          displayName: 'first',
        }),
      );

      const fixture = MockRender(TargetComponent);
      expect(fixture.point.componentInstance.name).toEqual(
        'firstName',
      );
    });

    it('covers last name', () => {
      // Customization for the use case.
      MockInstance(
        CONFIG,
        (): ConfigInterface => ({
          displayName: 'last',
        }),
      );

      const fixture = MockRender(TargetComponent);
      expect(fixture.point.componentInstance.name).toEqual(
        'lastName',
      );
    });
  });
});
