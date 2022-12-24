---
title: ngMocks.faster
description: Documentation about `ngMocks.faster` from ng-mocks library
---

There is a `ngMocks.faster` feature that optimizes setup of similar test modules between tests
and reduces required time on their execution.

Imagine a situation when `beforeEach` creates the same setup used by dozens of `it`.
This is the case where `ngMocks.faster` might be useful, simply use `beforeAll` instead of `beforeEach`,
call `ngMocks.faster` before `beforeAll` and
**the Angular tests will run faster**.

```ts
describe('performance:correct', () => {
  ngMocks.faster(); // <-- add it before

  // The TestBed is not going to be changed between tests.
  beforeAll(() => {
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

A possible solution is usage of [MockInstance](/api/MockInstance.md) instead of manual declaration,
or to move creation of spies outside of `beforeEach`.

## Example of MockInstance

```ts
describe('beforeEach:mock-instance', () => {
  ngMocks.faster(); // <-- add it before

  // A normal setup of the TestBed, TargetService will be replaced
  // with its mock object.
  // Do not forget to return the promise of MockBuilder.
  // TargetService is a provider in ItsModule.
  beforeEach(() => MockBuilder(TargetComponent, ItsModule));

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

## Example of optimizing spies in beforeEach

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
    return MockBuilder(TargetComponent, ItsModule)
      // TargetService is a provider in ItsModule.
      .mock(TargetService, mock);
  });
});
```

## MockRender

Usage of `ngMocks.faster()` covers [`MockRender`](/api/MockRender.md) too.

With its help, `MockRender` can be called in either `beforeEach` or `beforeAll`.
`beforeAll` won't reset its fixture after a test, and the fixture can be used in the next test.
Please pay attention that state of components also stays the same.

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/tests/issue-488/faster.spec.ts"
describe('issue-488:faster', () => {
  let fixture: MockedComponentFixture<MyComponent>;

  ngMocks.faster();

  beforeAll(() => MockBuilder(MyComponent, MyModule));
  beforeAll(() => (fixture = MockRender(MyComponent)));

  it('first test has initial render', () => {
    expect(ngMocks.formatText(fixture)).toEqual('1');

    fixture.point.componentInstance.value += 1;
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('2');

    fixture.point.componentInstance.reset();
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('0');
  });

  it('second test continues the prev state', () => {
    expect(ngMocks.formatText(fixture)).toEqual('0');

    fixture.point.componentInstance.value += 1;
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('1');

    fixture.point.componentInstance.reset();
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('0');
  });
});
```
