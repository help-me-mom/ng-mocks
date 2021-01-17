---
title: ngMocks.faster
description: Documentation about ngMocks.faster from ng-mocks library
---

There is a `ngMocks.faster` feature that optimizes setup of similar test modules between tests
and reduces required time on their execution.

Imagine a situation when `beforeEach` creates the same setup used by dozens of `it`.
This is the case where `ngMocks.faster` might be useful, simply call it before `beforeEach` and
**the Angular tests will run faster**.

```ts
describe('performance:correct', () => {
  ngMocks.faster(); // <-- add it before

  // The TestBed is not going to be changed between tests.
  beforeEach(() => {
    return MockBuilder(TargetComponent, TargetModule).keep(TargetService);
  });

  it('...', () => {
    // ...
  });

  it('...', () => {
    // ...
  });

  // ...
});
```

If a test creates spies in `beforeEach` then this should be tuned,
because `ngMocks.faster` will detect this difference and display a notice.

A possible solution is usage of [MockInstance](../MockInstance.md) or to move creation of spies
outside of `beforeEach`.

<details><summary>Click to see <strong>an example of MockInstance</strong></summary>
<p>

```ts
describe('beforeEach:mock-instance', () => {
  ngMocks.faster(); // <-- add it before

  // A normal setup of the TestBed, TargetService will be replaced
  // with its mock object.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetComponent).mock(TargetService));

  // Configuring behavior of the mock TargetService.
  beforeAll(() => {
    MockInstance(TargetService, {
      init: instance => {
        instance.method = jasmine.createSpy().and.returnValue(5);
        // in case of jest
        // instance.method = jest.fn().mockReturnValue(5);
        instance.prop = 123;
      },
    });
  });

  // Do not forget to reset the spy between runs.
  afterAll(MockReset);
});
```

</p>
</details>

<details><summary>Click to see <strong>an example of optimizing spies in beforeEach</strong></summary>
<p>

```ts
describe('beforeEach:manual-spy', () => {
  ngMocks.faster(); // <-- add it before

  // Creating a spy outside of `beforeEach` allows its pointer being
  // the same between tests and this let ngMocks.faster do its job.
  const mock = {
    method: jasmine.createSpy().and.returnValue(5),
    // in case of jest
    // method: jest.fn().mockReturnValue(5),
    prop: 123,
  };

  // Do not forget to reset the spy between runs.
  beforeEach(() => {
    mock.method.calls.reset();
    // in case of jest
    // mock.method = jest.fn().mockReturnValue(5);
    mock.prop = 123;
  });

  // A normal setup of the TestBed, TargetService will be replaced
  // with its mock object.
  beforeEach(() => {
    return MockBuilder(TargetComponent).mock(TargetService, mock);
  });
});
```

</p>
</details>
