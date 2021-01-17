---
title: getMockedNgDefOf
description: Documentation about getMockedNgDefOf from ng-mocks library
---

`getMockedNgDefOf` helps when in a test we want to get a mock class of something configured in TestBed.

```ts
// returns an existing `MockedModule<SomeClass>` of `SomeClass`
const mockModule = getMockedNgDefOf(SomeClass, 'm');

// returns an existing `MockedComponent<SomeClass>` of `SomeClass`
const mockComponent = getMockedNgDefOf(SomeClass, 'c');

// returns an existing `MockedDirective<SomeClass>` of `SomeClass`
const mockDirective = getMockedNgDefOf(SomeClass, 'd');

// returns an existing `MockedPipe<SomeClass>` of `SomeClass`
const mockPipe = getMockedNgDefOf(SomeClass, 'p');

// returns an existing mock class of `SomeClass`
const mock = getMockedNgDefOf(SomeClass);
```
