---
title: How to mock pipes in Angular tests
description: Information how to mock pipes in Angular tests with help of ng-mocks
sidebar_label: MockPipe
---

**A mock pipe in Angular tests** can be created by `MockPipe` function.
The second parameter of the function accepts a custom transform callback.
The mock pipe has the identical interface as its source pipe,
but all its methods are dummies.

To provide a mock pipe in a test, pass this source pipe into `MockPipe` function.

```ts
TestBed.configureTestingModule({
  declarations: [
    // for a single pipe
    MockPipe(Pipe),

    // a fake transform callback
    MockPipe(Pipe, value => JSON.stringify(value)),

    // for a set of pipe
    ...MockPipes(Pipe1, Pipe2),
  ],
});
```

A mock pipe has:

- the same `name`
- default transform is `() => undefined` to prevent problems with chaining
- support for [standalone pipes](#standalone-pipes)

## Simple example

Let's imagine that in an Angular application `TargetComponent` depends on `DependencyPipe` pipe,
and we would like to replace it with its mock pipe.

Usually a test looks like:

```ts
describe('Test', () => {
  let component: TargetComponent;
  let fixture: ComponentFixture<TargetComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [
        // our component for testing
        TargetComponent,

        // the annoying dependency
        DependencyPipe,
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To create **a mock pipe** out of a pipe, simply pass the original pipe into `MockPipe`:

```ts
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,

    // profit
    MockPipe(DependencyPipe, value => `mock:${value}`),
  ],
});
```

Or if we want to be like a pro, use [`MockBuilder`](MockBuilder.md), its [`.mock`](MockBuilder.md#mock) method
and call [`MockRender`](MockRender.md):

```ts
describe('Test', () => {
  beforeEach(() => {
    return MockBuilder(TargetComponent, ItsModule)
      // DependencyPipe is a declaration in ItsModule
      .mock(DependencyPipe, value => `mock:${value}`);
  });

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
    expect(fixture.nativeElement.innerHTML).toContain('mock:foo');

    // An instance of DependencyPipe from the fixture if we need it.
    const pipe = ngMocks.findInstance(DependencyPipe);
    expect(pipe).toBeDefined();
  });
});
```

## Standalone pipes

Since Angular 14, pipes can be implemented as a standalone declaration.
`ng-mocks` detects and correctly mocks them.
To mock a standalone pipe, you need to call `MockPipe` in imports:

```ts
TestBed.configureTestingModule({
  imports: [
    // for a single pipe
    MockPipe(StandalonePipe),
  ],
  declarations: [
    // our component for testing
    TargetComponent,
  ],
});
```

[`MockBuilder`](./MockBuilder.md) also supports and correctly works with standalone pipes.

## Advanced example

An advanced example of **mocking pipes** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockPipe/test.spec.ts&initialpath=%3Fspec%3DMockPipe)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockPipe/test.spec.ts&initialpath=%3Fspec%3DMockPipe)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockPipe/test.spec.ts"
// A fake transform function.
const fakeTransform = (...args: string[]) => JSON.stringify(args);

describe('MockPipe', () => {
  // A spy, just in case if we want to verify
  // how the pipe has been called.
  const spy = jasmine.createSpy().and.callFake(fakeTransform);
  // in case of jest
  // const spy = jest.fn().mockImplementation(fakeTransform);

  beforeEach(() => {
    return MockBuilder(TargetComponent, ItsModule)
      // DependencyPipe is a declaration in ItsModule
      .mock(
        DependencyPipe,
        spy,
      );
  });

  it('transforms values to json', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.nativeElement.innerHTML).toEqual(
      '<component>["foo"]</component>',
    );

    // Also we can find an instance of the pipe in
    // the fixture if it is needed.
    const pipe = ngMocks.findInstance(DependencyPipe);
    expect(pipe.transform).toHaveBeenCalledWith('foo');
    expect(pipe.transform).toHaveBeenCalledTimes(1);
  });
});
```
