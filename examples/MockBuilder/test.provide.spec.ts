import { Component, inject, Injectable } from '@angular/core';

import { MockBuilder, MockProvider, MockRender } from 'ng-mocks';

// A service with 2 methods.
// The tests below override getName only.
// Like a component store, it is not provided in root,
// it is provided where it is used.
@Injectable()
class StoreService {
  public getName(): string {
    return 'real';
  }

  public save(): boolean {
    return true;
  }
}

// This component injects StoreService from its environment,
// the tests below provide it.
@Component({
  selector: 'target-provide',
  standalone: true,
  template: '{{ store.getName() }}',
})
class TargetComponent {
  public readonly store = inject(StoreService);
}

// This component provides StoreService itself.
@Component({
  providers: [StoreService],
  selector: 'own-store-provide',
  standalone: true,
  template: '{{ store.getName() }}',
})
class OwnStoreComponent {
  public readonly store = inject(StoreService);
}

describe('MockBuilder:provide', () => {
  describe('plain provider', () => {
    // .provide adds the provider as it is,
    // it does not create a mock.
    beforeEach(() =>
      MockBuilder(TargetComponent).provide({
        provide: StoreService,
        useValue: { getName: () => 'fake' },
      }),
    );

    it('injects exactly the provided value', () => {
      const store =
        MockRender(TargetComponent).point.componentInstance.store;

      expect(store.getName()).toEqual('fake');
      // The value is not a mock of StoreService,
      // therefore, it does not have the save method.
      expect(store.save).toBeUndefined();
    });
  });

  describe('MockProvider', () => {
    // MockProvider creates a mock of StoreService
    // and applies the overrides to it.
    beforeEach(() =>
      MockBuilder(TargetComponent).provide(
        MockProvider(StoreService, { getName: () => 'fake' }),
      ),
    );

    it('injects a mock with the overrides', () => {
      const store =
        MockRender(TargetComponent).point.componentInstance.store;

      expect(store.getName()).toEqual('fake');
      // Other methods are empty dummies.
      expect(store.save()).toBeUndefined();
    });
  });

  describe('mock', () => {
    // The same result as .provide(MockProvider(...)).
    beforeEach(() =>
      MockBuilder(TargetComponent).mock(StoreService, {
        getName: () => 'fake',
      }),
    );

    it('injects a mock with the overrides', () => {
      const store =
        MockRender(TargetComponent).point.componentInstance.store;

      expect(store.getName()).toEqual('fake');
      expect(store.save()).toBeUndefined();
    });
  });

  describe('provider of a component', () => {
    describe('provide', () => {
      // .provide adds StoreService to TestBed,
      // but OwnStoreComponent injects StoreService from its own providers,
      // because providers of a component have priority.
      beforeEach(() =>
        MockBuilder(OwnStoreComponent).provide(
          MockProvider(StoreService, { getName: () => 'fake' }),
        ),
      );

      it('does not use .provide for the provider of the component', () => {
        const store =
          MockRender(OwnStoreComponent).point.componentInstance.store;

        // OwnStoreComponent is standalone, therefore, MockBuilder mocks
        // its providers, but without the overrides from .provide.
        expect(store.getName()).toBeUndefined();
        expect(store.save()).toBeUndefined();
      });
    });

    describe('mock', () => {
      // .mock replaces StoreService in providers of OwnStoreComponent too.
      beforeEach(() =>
        MockBuilder(OwnStoreComponent).mock(StoreService, {
          getName: () => 'fake',
        }),
      );

      it('replaces the provider of the component', () => {
        const store =
          MockRender(OwnStoreComponent).point.componentInstance.store;

        expect(store.getName()).toEqual('fake');
        expect(store.save()).toBeUndefined();
      });
    });
  });
});
