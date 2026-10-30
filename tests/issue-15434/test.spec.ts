import {
  Component,
  inject,
  Injectable,
  Service,
} from '@angular/core';

import {
  MockBuilder,
  MockProvider,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Service()
class Store {
  public static constructed = 0;

  public constructor() {
    Store.constructed += 1;
  }

  public a(): number {
    return 1;
  }

  public b(): number {
    return 2;
  }
}

@Service({ autoProvided: false })
class LocalStore {
  public static constructed = 0;

  public constructor() {
    LocalStore.constructed += 1;
  }

  public a(): number {
    return 1;
  }

  public b(): number {
    return 2;
  }
}

@Injectable({ providedIn: 'root' })
class InjectableStore {
  public a(): number {
    return 1;
  }

  public b(): number {
    return 2;
  }
}

@Component({
  selector: 'target-15434',
  standalone: true,
  template: '{{ store.a() }}:{{ store.b() }}',
})
class TargetComponent {
  public readonly store = inject(Store);
}

@Component({
  selector: 'local-15434',
  standalone: true,
  providers: [LocalStore],
  template: '{{ store.a() }}:{{ store.b() }}',
})
class LocalComponent {
  public readonly store = inject(LocalStore);
}

@Component({
  selector: 'injectable-15434',
  standalone: true,
  template: '{{ store.a() }}:{{ store.b() }}',
})
class InjectableComponent {
  public readonly store = inject(InjectableStore);
}

// A partial shape must customize the auto-mock, preserving its other methods.
// @see https://github.com/help-me-mom/ng-mocks/issues/15434
describe('issue-15434', () => {
  beforeEach(() => {
    Store.constructed = 0;
    LocalStore.constructed = 0;
  });

  it('renders a partial mock of an automatically provided Service', async () => {
    await MockBuilder(TargetComponent).mock(Store, { a: () => 5 });

    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('5:');
    expect(fixture.point.componentInstance.store.b()).toBeUndefined();
    expect(Store.constructed).toBe(0);
  });

  it('renders a partial mock of a locally provided Service', async () => {
    await MockBuilder(LocalComponent).mock(LocalStore, {
      a: () => 5,
    });

    const fixture = MockRender(LocalComponent);

    expect(ngMocks.formatText(fixture)).toEqual('5:');
    expect(fixture.point.componentInstance.store.b()).toBeUndefined();
    expect(LocalStore.constructed).toBe(0);
  });

  it('preserves partial mock behavior for Injectable', async () => {
    await MockBuilder(InjectableComponent).mock(InjectableStore, {
      a: () => 5,
    });

    const fixture = MockRender(InjectableComponent);

    expect(ngMocks.formatText(fixture)).toEqual('5:');
    expect(fixture.point.componentInstance.store.b()).toBeUndefined();
  });

  it('preserves Service auto-mocking without a shape', async () => {
    await MockBuilder(TargetComponent).mock(Store);

    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual(':');
    expect(fixture.point.componentInstance.store.a()).toBeUndefined();
    expect(fixture.point.componentInstance.store.b()).toBeUndefined();
  });

  it('supports an explicit MockProvider with a partial shape', async () => {
    await MockBuilder(TargetComponent).provide(
      MockProvider(Store, { a: () => 5 }),
    );

    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('5:');
    expect(fixture.point.componentInstance.store.b()).toBeUndefined();
  });

  it('preserves precise replacement identity', async () => {
    const shape = { a: () => 5, b: () => 6 };
    await MockBuilder(TargetComponent).mock(Store, shape, {
      precise: true,
    });

    const fixture = MockRender(TargetComponent);

    expect(fixture.point.componentInstance.store).toBe(shape);
    expect(ngMocks.formatText(fixture)).toEqual('5:6');
  });
});
