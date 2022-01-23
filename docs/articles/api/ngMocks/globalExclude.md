---
title: ngMocks.globalExclude
description: Documentation about ngMocks.globalExclude from ng-mocks library
---

`ngMocks.globalExclude` marks declarations, services and tokens to be excluded during creating mock modules.

The best place to do that is in `src/test.ts` for `jasmine` or in `src/setup-jest.ts` for `jest`.

It is useful when some of them have been provided in `TestBed.initTestEnvironment`,
and we would like to get these versions in tests, although something declares or imports original ones.

Let's imagine that we have `TranslationModule` and would like to use it as it is in tests, but with a mock backend.
In the same time, we would like to avoid repeating setups in every test to recreate that.

Therefore, we can configure it via `initTestEnvironment`, but there is a problem.
If we import a module that imports `TranslationModule` in tests,
then this effect of `initTestEnvironment` will be overloaded.

To keep the effect, we need to exclude `TranslationModule` during the mocking process.
That is where `ngMocks.globalExclude` comes for help.

```ts title="src/test.ts"
@NgModule({
  imports: [TranslationModule.forRoot(mockBackend)],
  exports: [BrowserDynamicTestingModule, TranslationModule],
})
class TestEnvModule {}

getTestBed().initTestEnvironment(
  TestEnvModule,
  platformBrowserDynamicTesting(),
);

ngMocks.globalExclude(TranslationModule);
```

Now, if we call `MockModule(ModuleWithTranslationModule)`,
the `TranslationModule` will be excluded out of the final mock module,
and, consequently, the version from `initTestEnvironment` will be used.
