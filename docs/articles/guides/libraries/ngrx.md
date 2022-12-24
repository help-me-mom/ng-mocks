---
title: How to test usage of ngrx in Angular applications
sidebar_label: NGRX
---

`ng-mocks` perfectly mocks `NGRX` modules. However, there are might be issues if some of them should be kept.

`StoreModule` and `EffectsModule` are entry point factory modules to configure reducers and effects.
Under the hood, `NGRX` uses four modules, and these modules should be configured in `MockBuilder`:

- `StoreRootModule` for `StoreModule.forRoot`
- `StoreFeatureModule` for `StoreModule.forFeature`
* `EffectsRootModule` for `EffectsModule.forRoot`
* `EffectsFeatureModule` for `EffectsModule.forFeature`

Let's imagine that we want to keep `ngrx` in a test.
In this case, we should pass the modules into [`.keep`](/api/MockBuilder.md#keep):

```ts
beforeEach(() =>
   MockBuilder(TargetComponent, TargetModule)
     .keep(StoreRootModule) // keeps all StoreModule.forRoot
     .keep(StoreFeatureModule) // keeps all StoreModule.forFeature
     .keep(EffectsRootModule) // keeps all EffectsModule.forRoot
     .keep(EffectsFeatureModule) // keeps all EffectsModule.forFeature
 );
```

## Lazy loaded modules with `.forFeature()`

When you want to test a lazy loaded module which does not import `StoreModule.forRoot()`, or `EffectsModule.forRoot()`,
and only has `StoreModule.forFeature` or `EffectsModule.forFeature`,
you need to add `.forRoot()` manually:

```ts
beforeEach(() =>
  MockBuilder(
    // keep and export
    [
      SomeComponent,
      // providing root tools
      StoreModule.forRoot({}),
      EffectsModule.forRoot(),     
    ],
    // mock
    LazyLoadedModule,
  )

  // keeping lazy loaded module imports
  .keep(StoreFeatureModule) // keeps all StoreModule.forFeature
  .keep(EffectsFeatureModule) // keeps all EffectsModule.forFeature
);
```

## provideMockStore

When you want to test integration with `ngrx` modules, you can use `provideMockStore` with `MockBuilder`:

```ts
beforeEach(() =>
  MockBuilder(TargetComponent, TargetModule).provide(
    provideMockStore({
      initialState: {
        // ...
      },
    }),
  ),
);
```

It might be needed to use [`MockRenderFactory`](/api/MockRender.md#factory),
if you need to get a `Store` instance before rendering:

```ts
describe('provideMockStore:MockBuilder', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).provide(
      provideMockStore({
        initialState: {
          [myReducer.featureKey]: 'mock',
        },
      }),
    ),
  );

  // creating a factory for render
  const factory = MockRenderFactory(TargetComponent);
  beforeEach(() => factory.configureTestBed());

  it('selects the value', () => {
    // injecting Store
    const store = TestBed.inject(Store);
    const dispatchSpy = spyOn(store, 'dispatch');

    // rendering
    const fixture = factory();

    // asserting
    expect(ngMocks.formatText(fixture)).toEqual('mock');
    expect(dispatchSpy).toHaveBeenCalledWith(
      setValue({ value: 'target' }),
    );
  });
});
```

## Meta reducers

:::warning
A mock meta reducer stops all reducers in the store
:::

### StoreDevtoolsModule

If you have a module which has a meta reducer, such as `StoreDevtoolsModule`,
then **please don't forget to keep it too** if you plan to keep store modules for testing.
Otherwise, no actions will be reduced, and the store will be always empty.

As an option, such a **module could be excluded** to avoid any side effects: `.exclude(StoreDevtoolsModule)`.

### USER_PROVIDED_META_REDUCERS

Apart from that, it might be needed to keep `StoreRootModule`, but suppress all manually injected meta reducers.
In order to do so, simply mock `USER_PROVIDED_META_REDUCERS` token with an empty array:
`.mock(USER_PROVIDED_META_REDUCERS, [])`. 

Then **zero meta reducers** will be provided in current test suites.
