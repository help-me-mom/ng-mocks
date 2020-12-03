import { MockModule } from 'ng-mocks';

class MyModule {}

abstract class AbstractModule {}

const moduleWithProviders = {
  ngModule: MyModule,
  providers: [],
};

const abstractModuleWithProviders = {
  ngModule: AbstractModule,
  providers: [],
};

// Any class works well.
MockModule(MyModule);

// A module with providers works well.
MockModule(moduleWithProviders);

// @ts-expect-error: does not accept an abstract module.
MockModule(AbstractModule);

// @ts-expect-error: does not accept an abstract module with providers.
MockModule(abstractModuleWithProviders);
