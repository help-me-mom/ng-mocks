---
title: How to test a provider in Angular application
description: Covering an Angular provider with tests
sidebar_label: Provider
---

Usually, you do not need `TestBed` if you want to test a simple
provider, the best way would be to write isolated pure unit tests.

Nevertheless, [`MockBuilder`](https://www.npmjs.com/package/ng-mocks#mockbuilder) might help here too. If a provider has complex dependencies, or you want to verify
that its module creates the provider in a particular way, then simply pass the provider as the first parameter and its module as the second one.

```ts
beforeEach(() => MockBuilder(TargetService, TargetModule));
```

In a test you need to use the global injector for getting an instance of the service to assert its behavior:

```ts
const service = TestBed.get(TargetService);
expect(service.echo()).toEqual(service.value);
```

What might be useful here is knowledge of how to customize the dependencies.
There are 3 options: `.mock`, `.provide` and `MockInstance`. All of them are a good choice:

```ts
beforeEach(() =>
  MockBuilder(TargetService, TargetModule)
    // Service2 is provided / imported in TargetModule
    .mock(Service2, {
      trigger: () => 'mock2',
    })
    // Service3 will be provided in TestBed
    .provide({
      provide: Service3,
      useValue: {
        trigger: () => 'mock3',
      },
    })
);
```

```ts
beforeAll(() => {
  MockInstance(Service1, {
    init: instance => {
      instance.trigger = () => 'mock1';
    },
  });
});
```

Despite the way providers are created: `useClass`, `useValue` etc.
Their tests are quite similar.

## Live example for common case

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestProvider/test.spec.ts&initialpath=%3Fspec%3DTestProviderCommon)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestProvider/test.spec.ts&initialpath=%3Fspec%3DTestProviderCommon)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestProvider/test.spec.ts"
import { Injectable } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// A simple service, might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value = true;

  public echo(): boolean {
    return this.value;
  }
}

describe('TestProviderCommon', () => {
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService));

  it('returns value on echo', () => {
    const service = MockRender(TargetService).point.componentInstance;

    expect(service.echo()).toEqual(service.value);
  });
});
```

## Live example with dependencies

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestProviderWithDependencies/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithDependencies)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestProviderWithDependencies/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithDependencies)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestProviderWithDependencies/test.spec.ts"
import { Injectable, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

// Dependency 1
@Injectable()
class Service1 {
  protected name = 'service1';

  public trigger(): string {
    return this.name;
  }
}
// Dependency 2
@Injectable()
class Service2 {
  protected name = 'service2';

  public trigger(): string {
    return this.name;
  }
}

// A simple service, it might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly value1: string;
  public readonly value2: string;

  public constructor(dep1: Service1, dep2: Service2) {
    this.value1 = dep1.trigger();
    this.value2 = dep2.trigger();
  }
}

// A module that provides all services.
@NgModule({
  providers: [Service1, Service2, TargetService],
})
class TargetModule {}

describe('TestProviderWithDependencies', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its dependencies
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  beforeAll(() => {
    // Let's customize a bit behavior of the mock copy of Service1.
    MockInstance(Service1, {
      init: instance => {
        instance.trigger = () => 'mock1';
      },
    });
    // Let's customize a bit behavior of the mock copy of Service2.
    MockInstance(Service2, {
      init: instance => {
        instance.trigger = () => 'mock2';
      },
    });
  });

  // Resets customizations from MockInstance.
  afterAll(MockReset);

  it('creates TargetService', () => {
    // Creates an instance only if all dependencies are present.
    const service = MockRender(TargetService).point.componentInstance;

    // Let's assert behavior.
    expect(service.value1).toEqual('mock1');
    expect(service.value2).toEqual('mock2');
  });
});
```

## Live example for useClass

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestProviderWithUseClass/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithUseClass)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestProviderWithUseClass/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithUseClass)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestProviderWithUseClass/test.spec.ts"
import { Injectable, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

// A service we want to replace via useClass.
@Injectable()
class Service1 {
  public constructor(public name: string) {}
}

// A service replacing the Service1.
@Injectable()
class Service2 extends Service1 {
  public readonly flag = true;
}

// A service we want to test and to replace via useClass.
@Injectable()
class Target1Service {
  public constructor(public readonly service: Service1) {}
}

// A service replacing the Target1Service.
@Injectable()
class Target2Service extends Target1Service {
  public readonly flag = true;
}

// A module that provides all services.
@NgModule({
  providers: [
    {
      provide: 'real',
      useValue: 'real',
    },
    {
      deps: ['real'],
      provide: Service1,
      useClass: Service2,
    },
    {
      deps: [Service1],
      provide: Target1Service,
      useClass: Target2Service,
    },
  ],
})
class TargetModule {}

describe('TestProviderWithUseClass', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its dependencies
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(Target1Service, TargetModule));

  beforeAll(() => {
    // Let's customize a bit behavior of the mock copy of Service1.
    MockInstance(Service1, {
      init: instance => {
        instance.name = 'mock1';
      },
    });
  });

  // Resets customizations from MockInstance.
  afterAll(MockReset);

  it('respects all dependencies', () => {
    const service = MockRender<
      Target1Service & Partial<Target2Service>
    >(Target1Service).point.componentInstance;

    // Let's assert that service has a flag from Target2Service.
    expect(service.flag).toBeTruthy();
    expect(service).toEqual(jasmine.any(Target2Service));

    // And let's assert that Service1 has been replaced with its mock copy
    // and its name is undefined.
    expect(service.service.name).toEqual('mock1');
    expect(service.service).toEqual(jasmine.any(Service1));

    // Because we use a mock module, Service1 has been replaced with
    // a mock copy based on its `provide` class, deps and other
    // values are ignored by building mocks logic.
    expect(service.service).not.toEqual(jasmine.any(Service2));
  });
});
```

## Live example for useValue

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestProviderWithUseValue/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithUseValue)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestProviderWithUseValue/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithUseValue)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestProviderWithUseValue/test.spec.ts"
import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

// A simple service, it might have contained more logic,
// but it is redundant for the test demonstration.
@Injectable()
class TargetService {
  public readonly name = 'target';
}

// A module that provides all services.
@NgModule({
  providers: [
    {
      provide: TargetService,
      // an empty object instead
      useValue: {
        service: null,
      },
    },
  ],
})
class TargetModule {}

describe('TestProviderWithUseValue', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its initialization
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  it('creates TargetService', () => {
    const service =
      MockRender<TargetService>(TargetService).point
        .componentInstance;

    // Let's assert received data.
    expect(service as any).toEqual({
      service: null,
    });
  });
});
```

## Live example for useExisting

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestProviderWithUseExisting/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithUseExisting)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestProviderWithUseExisting/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithUseExisting)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestProviderWithUseExisting/test.spec.ts"
import { Injectable, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

// A service we want to use.
@Injectable()
class Service1 {
  public name = 'target';
}

// A service we want to replace.
@Injectable()
class Service2 {
  public name = 'target';
}

// A service we want to test and to replace via useExisting.
@Injectable()
class TargetService {}

// A module that provides all services.
@NgModule({
  providers: [
    Service1,
    {
      provide: Service2,
      useExisting: Service1,
    },
    {
      provide: TargetService,
      useExisting: Service2,
    },
  ],
})
class TargetModule {}

describe('TestProviderWithUseExisting', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its initialization
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  beforeAll(() => {
    // Let's customize a bit behavior of the mock copy of Service1.
    MockInstance(Service2, {
      init: instance => {
        instance.name = 'mock2';
      },
    });
  });

  // Resets customizations from MockInstance.
  afterAll(MockReset);

  it('creates TargetService', () => {
    const service = MockRender<
      TargetService & Partial<{ name: string }>
    >(TargetService).point.componentInstance;

    // Because Service2 has been replaced with a mock copy,
    // we are getting here a mock copy of Service2 instead of Service1.
    expect(service).toEqual(jasmine.any(Service2));
    // Because we have kept TargetService we are getting here a
    // mock copy of Service2 as it says in useExisting.
    expect(service.name).toEqual('mock2');
  });
});
```

## Live example for useFactory

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestProviderWithUseFactory/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithUseFactory)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestProviderWithUseFactory/test.spec.ts&initialpath=%3Fspec%3DTestProviderWithUseFactory)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/TestProviderWithUseFactory/test.spec.ts"
import { Injectable, NgModule } from '@angular/core';

import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
} from 'ng-mocks';

// Dependency 1.
@Injectable()
class Service1 {
  public name = 'target';
}

// A service we want to use.
@Injectable()
class TargetService {
  public constructor(public readonly service: Service1) {}
}

// A module that provides all services.
@NgModule({
  providers: [
    Service1,
    {
      deps: [Service1],
      provide: TargetService,
      useFactory: (service: Service1) => new TargetService(service),
    },
  ],
})
class TargetModule {}

describe('TestProviderWithUseFactory', () => {
  // Because we want to test the service, we pass it as the first
  // parameter of MockBuilder. To correctly satisfy its initialization
  // we need to pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetService, TargetModule));

  beforeAll(() => {
    // Let's customize a bit behavior of the mock copy of Service1.
    MockInstance(Service1, {
      init: instance => {
        instance.name = 'mock1';
      },
    });
  });

  // Resets customizations from MockInstance.
  afterAll(MockReset);

  it('creates TargetService', () => {
    const service = MockRender(TargetService).point.componentInstance;

    // Because Service1 has been replaced with a mock copy, we should get mock1 here.
    expect(service.service.name).toEqual('mock1');
  });
});
```
