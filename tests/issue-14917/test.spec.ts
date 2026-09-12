import { Injectable, InjectionToken } from '@angular/core';

import { MockBuilder, ngMocks } from 'ng-mocks';

const PROVIDED_IN: Injectable['providedIn'] = 'root';

@Injectable({ providedIn: 'root' })
class Dependency {
  public readonly name = 'dependency';
}

const CLASS_DEPENDENCY = new InjectionToken<Dependency>(
  'CLASS_DEPENDENCY',
);
const FACTORY_DEPENDENCY = new InjectionToken<Dependency>(
  'FACTORY_DEPENDENCY',
);
class Value {
  public constructor(public readonly name: string) {}
}

const VALUE = new Value('value');

@Injectable({ providedIn: 'root' })
class Implementation {
  public constructor(public readonly dependency: Dependency) {}
}

const EXISTING_PROVIDER = {
  providedIn: PROVIDED_IN,
  useExisting: Implementation,
};

// Model compiled library metadata: JIT Injectable annotations omit provider options.
@Injectable(EXISTING_PROVIDER)
class ExistingTarget {
  public static decorators = [
    { type: Injectable, args: [EXISTING_PROVIDER] },
  ];

  public constructor(public readonly dependency: Dependency) {
    throw new Error('existing token constructor');
  }
}

const CLASS_PROVIDER = {
  providedIn: PROVIDED_IN,
  useClass: Implementation,
  deps: [CLASS_DEPENDENCY],
};

@Injectable(CLASS_PROVIDER)
class ClassTarget {
  public static decorators = [
    { type: Injectable, args: [CLASS_PROVIDER] },
  ];

  public constructor(public readonly dependency: Dependency) {
    throw new Error('class token constructor');
  }
}

const IMPLICIT_CLASS_PROVIDER = {
  providedIn: PROVIDED_IN,
  useClass: Implementation,
};

@Injectable(IMPLICIT_CLASS_PROVIDER)
class ImplicitClassTarget {
  public static decorators = [
    { type: Injectable, args: [IMPLICIT_CLASS_PROVIDER] },
  ];

  public constructor(public readonly dependency: Dependency) {
    throw new Error('implicit class token constructor');
  }
}

const VALUE_PROVIDER = {
  providedIn: PROVIDED_IN,
  useValue: VALUE,
};

@Injectable(VALUE_PROVIDER)
class ValueTarget {
  public static decorators = [
    { type: Injectable, args: [VALUE_PROVIDER] },
  ];

  public readonly name: string = 'token';

  public constructor() {
    throw new Error('value token constructor');
  }
}

const FALSY_PROVIDER = {
  providedIn: PROVIDED_IN,
  useValue: false,
};

@Injectable(FALSY_PROVIDER)
class FalsyTarget {
  public static decorators = [
    { type: Injectable, args: [FALSY_PROVIDER] },
  ];

  public constructor() {
    throw new Error('falsy token constructor');
  }
}

const FACTORY_PROVIDER = {
  providedIn: PROVIDED_IN,
  useFactory: (dependency: Dependency) => ({ dependency }),
  deps: [FACTORY_DEPENDENCY],
};

@Injectable(FACTORY_PROVIDER)
class FactoryTarget {
  public static decorators = [
    { type: Injectable, args: [FACTORY_PROVIDER] },
  ];

  public constructor(public readonly dependency: Dependency) {
    throw new Error('factory token constructor');
  }
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14917
describe('issue-14917', () => {
  it('keeps the root useExisting alias and dependency identity', async () => {
    await MockBuilder()
      .keep(Dependency)
      .keep(Implementation)
      .keep(ExistingTarget);

    // Replacing the root recipe with a class provider runs the token constructor.
    const service = ngMocks.get(ExistingTarget);
    expect(service).toBe(ngMocks.get(Implementation));
    expect(service.dependency).toBe(ngMocks.get(Dependency));
  });

  it('keeps the root useClass implementation and explicit dependencies', async () => {
    const dependency = new Dependency();
    await MockBuilder()
      .keep(Dependency)
      .keep(ClassTarget)
      .provide({ provide: CLASS_DEPENDENCY, useValue: dependency });

    const service = ngMocks.get(ClassTarget);
    expect(service instanceof Implementation).toBe(true);
    expect(service.dependency).toBe(dependency);
    expect(service.dependency).not.toBe(ngMocks.get(Dependency));
  });

  it('keeps inferred dependencies of root class implementations', async () => {
    await MockBuilder().keep(Dependency).keep(ImplicitClassTarget);

    const service = ngMocks.get(ImplicitClassTarget);
    expect(service instanceof Implementation).toBe(true);
    expect(service.dependency).toBe(ngMocks.get(Dependency));
  });

  it('keeps the exact root useValue object', async () => {
    await MockBuilder().keep(ValueTarget);

    expect(ngMocks.get(ValueTarget)).toBe(VALUE);
  });

  it('keeps a falsy root useValue', async () => {
    await MockBuilder().keep(FalsyTarget);

    expect(ngMocks.get(FalsyTarget)).toBe(false);
  });

  it('preserves root useFactory and explicit dependencies', async () => {
    const dependency = new Dependency();
    await MockBuilder()
      .keep(FactoryTarget)
      .provide({ provide: FACTORY_DEPENDENCY, useValue: dependency });

    expect(ngMocks.get(FactoryTarget).dependency).toBe(dependency);
  });

  it('lets explicit providers override kept root recipes', async () => {
    const dependency = new Dependency();
    const existing = new Implementation(dependency);
    const implementation = new Implementation(dependency);
    const value = new Value('override');
    await MockBuilder()
      .keep(ExistingTarget)
      .keep(ClassTarget)
      .keep(ValueTarget)
      .provide([
        { provide: ExistingTarget, useValue: existing },
        { provide: ClassTarget, useValue: implementation },
        { provide: ValueTarget, useValue: value },
      ]);

    expect(ngMocks.get(ExistingTarget)).toBe(existing);
    expect(ngMocks.get(ClassTarget)).toBe(implementation);
    expect(ngMocks.get(ValueTarget)).toBe(value);
  });

  it('keeps aliases when the provider is the builder target', async () => {
    await MockBuilder(ExistingTarget)
      .keep(Implementation)
      .keep(Dependency);

    const service = ngMocks.get(ExistingTarget);
    expect(service).toBe(ngMocks.get(Implementation));
    expect(service.dependency).toBe(ngMocks.get(Dependency));
  });

  it('keeps class recipes when the provider is the builder target', async () => {
    const dependency = new Dependency();
    await MockBuilder(ClassTarget).provide({
      provide: CLASS_DEPENDENCY,
      useValue: dependency,
    });

    const service = ngMocks.get(ClassTarget);
    expect(service instanceof Implementation).toBe(true);
    expect(service.dependency).toBe(dependency);
  });

  it('keeps values when the provider is the builder target', async () => {
    await MockBuilder(ValueTarget);

    expect(ngMocks.get(ValueTarget)).toBe(VALUE);
  });
});
