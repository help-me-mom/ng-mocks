---
title: How to test usage of ngrx in Angular applications
sidebar_label: NGRX
---

`ng-mocks` perfectly mocks `NGRX` modules. However, there are might be issues if some of them should be kept.

Besides `StoreModule`, which is an entry point to configure effects and reducers,
under the hood `NGRX` uses four other modules, and these modules should be configured in `MockBuilder`:

- `StoreRootModule`
- `StoreFeatureModule`
* `EffectsRootModule`
* `EffectsFeatureModule`

Or a simple value is to rely on `.ngModule` property: 

- `StoreModule.forRoot().ngModule`
- `StoreModule.forFeature().ngModule`
* `EffectsModule.forRoot().ngModule`
* `EffectsModule.forFeature().ngModule`

Let's imagine that we want to keep `StoreModule` in a test,
then we should pass the modules into [`.keep`](../../api/MockBuilder.md#keep):

```ts
beforeEach(() =>
   MockBuilder(MyComponent, MyModule)
     .keep(StoreRootModule)
     .keep(StoreFeatureModule)
     .keep(EffectsRootModule)
     .keep(EffectsFeatureModule)
 );
```

or

```ts
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(StoreModule.forRoot().ngModule)
    .keep(StoreModule.forFeature().ngModule)
    .keep(EffectsModule.forRoot().ngModule)
    .keep(EffectsModule.forFeature().ngModule)
);
```

Please pay attention that `MyModule` or its imports should import `.forRoot` and `.forFeature`,
otherwise we need to call [`.keep`](../../api/MockBuilder.md#keep) as usually:

```ts
beforeEach(() =>
  MockBuilder(MyComponent, MyModule)
    .keep(StoreModule.forRoot())
    .keep(StoreModule.forFeature())
    .keep(EffectsModule.forRoot())
    .keep(EffectsModule.forFeature())
);
```

## Lazy loaded modules with `.forFeature()`

When we want to test a lazy loaded module, it means there is no import of `.forRoot()` calls,
because they are in a parent module.
Therefore, the `.forRoot()` calls should be added manually without any special configuration:

```ts
beforeEach(() =>
  MockBuilder(SomeComponent, LazyLoadedModule)
    // providing root tools
    .keep(StoreModule.forRoot())
    .keep(EffectsModule.forRoot())
    // keeping lazy loaded module definitions
    .keep(StoreFeatureModule)
    .keep(EffectsFeatureModule)
);
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
