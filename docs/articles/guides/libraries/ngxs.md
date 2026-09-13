---
title: How to test NGXS in Angular applications
sidebar_label: NGXS
---

If you need to avoid mocking `NGXS` in your modules, use [`.keep`](/api/MockBuilder.md#keep).

```ts
beforeEach(() =>
   MockBuilder(TargetComponent, TargetModule)
     
     // NgxsModule.forRoot() is called in TargetModule or its imports 
     .keep(NgxsModule.forRoot().ngModule) // keeps all NgxsModule.forRoot
     
     // add it only if your module imports NgxsModule.forFeature
     // NgxsModule.forFeature() is called in TargetModule or its imports
     .keep(NgxsModule.forFeature().ngModule) // keeps all NgxsModule.forFeature
     
     // keeps the root provider of the store
     .keep(Store)
 );
```

If your module imports only `NgxsModule.forFeature`, use a test module to initialize
`NgxsModule.forRoot()` before the feature module. Keep `Store` as a dependency so its
NGXS root services stay real:

```ts
@NgModule({
  imports: [NgxsModule.forRoot(), TargetModule],
})
class TestModule {}

beforeEach(() =>
   MockBuilder(TargetComponent, TestModule)
     .keep(Store)
     .keep(NgxsModule.forRoot().ngModule)
     .keep(NgxsModule.forFeature().ngModule)
 );
```
