---
title: How to mock observable streams in Angular tests
description: Information how to mock observables in Angular tests
sidebar_label: Mock observables
---

**A mock observable in Angular tests** can be created by
[`MockProvider`](../api/MockProvider.md),
[`MockInstance`](../api/MockInstance.md) or
[`ngMocks.defaultMock`](../api/ngMocks/defaultMock.md).

## The problem

For example, if we have `TodoService.list$()`,
that returns a type of `Observable<Array<Todo>>`,
and a component,
that fetches the list in `OnInit` via `subscribe` method:

```ts
class TodoComponent implements OnInit {
  public list: Observable<Array<Todo>>;

  constructor(protected service: TodoService) {}

  ngOnInit(): void {
    // Never do like that.
    // It is just for the demonstration purposes.
    this.service.list$().subscribe(list => (this.list = list));
  }
}
```

If we wanted to test the component, we would like to replace its dependencies with their mocks.
In our case it is `TodoService`.

```ts
TestBed.configureTestingModule({
  declarations: [TodoComponent],
  providers: [MockProvider(TodoService)],
});
```

If we created a fixture, we would face an error about reading properties of `undefined`. This happens because a mock object of `TodoService.list$`
returns a spy, if [auto spy](auto-spy.md) has been configured, or `undefined`. Therefore, neither has the `subscribe` property.

## The solution

Obviously, to solve this, we need to get the method to return an observable stream.
For that, we could extend the mock object via passing overrides as the second parameter into [`MockProvider`](../api/MockProvider.md).

```ts
TestBed.configureTestingModule({
  declarations: [TodoComponent],
  providers: [
    MockProvider(TodoService, {
      list$: () => EMPTY,
    }),
  ],
});
```

Profit, now initialization of the component does not throw the error anymore.

## Permanent fix

If we want to do it for all tests globally, we might use [`ngMocks.defaultMock`](../api/ngMocks/defaultMock.md).

```ts
ngMocks.defaultMock(TodoService, () => ({
  list$: () => EMPTY,
}));
```

Then, every time tests need a mock object of `TodoService`, its `list$()` will return `EMPTY`.

## Customizing observable streams

Nevertheless, usually, we want not only to return a stub result as `EMPTY` observable stream,
but also to provide a fake subject, that would simulate its calls.

A possible solution is to use [`MockInstance`](../api/MockInstance.md) within the `it` context:

```ts
beforeEach(() => {
  TestBed.configureTestingModule({
    declarations: [TodoComponent],
    providers: [MockProvider(TodoService)],
  });
});

it('test', () => {
  const fakeList$ = new Subject(); // <- create the subject.
  const list$ = jasmine.createSpy().and.returnValue(fakeList$);
  MockInstance(TodoService, () => ({
    list$,
  }));

  const fixture = TestBed.createComponent(TodoComponent);
  fixture.detectChanges();

  // Here we can do some assertions.
  expect(list$).toHaveBeenCalledTimes(1);

  // Let's simulate emits.
  fakeList$.next([]);
});
```

A solution for [`MockBuilder`](../api/MockBuilder.md) is quite similar.

```ts
let todoServiceList$: Subject<any>; // <- a context variable.

beforeEach(() => {
  todoServiceList$ = new Subject(); // <- create the subject.

  return MockBuilder(TodoComponent, ItsModule)
    // TodoService is provided in ItsModule
    .mock(TodoService, {
      list$: () => todoServiceList$,
    });
});

it('test', () => {
  const fixture = MockRender(TodoComponent);
  todoServiceList$.next([]);
  // some assertions.
});
```

This all might be implemented with [`MockInstance`](../api/MockInstance.md) too,
but it goes beyond the topic.

## Advanced example

An advanced example of **mocking observables** in Angular tests.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockObservable/test.spec.ts&initialpath=%3Fspec%3DMockObservable)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockObservable/test.spec.ts&initialpath=%3Fspec%3DMockObservable)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockObservable/test.spec.ts"
describe('MockObservable', () => {
  // Because we want to test the component, we pass it as the first
  // parameter of MockBuilder. To create its mock dependencies
  // we pass its module as the second parameter.
  // Do not forget to return the promise of MockBuilder.
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  // Now we need to customize the mock object of the service.
  // value$ is our access point to the stream.
  const value$: Subject<number[]> = new Subject();
  beforeAll(() => {
    // MockInstance helps to override mock instances.
    MockInstance(TargetService, instance =>
      ngMocks.stub(instance, {
        value$, // even it is a read-only property we can override.
      }),
    );
  });

  // Cleanup after tests.
  afterAll(() => {
    value$.complete();
    MockInstance(TargetService);
  });

  it('listens on emits of an injected subject', () => {
    // Let's render the component.
    const fixture = MockRender(TargetComponent);

    // We have not emitted anything yet, let's check the template.
    expect(fixture.nativeElement.innerHTML).not.toContain('1');
    expect(fixture.nativeElement.innerHTML).not.toContain('2');
    expect(fixture.nativeElement.innerHTML).not.toContain('3');

    // Let's simulate an emit.
    value$.next([1, 2, 3]);
    fixture.detectChanges();

    // The template should contain the emitted numbers.
    expect(fixture.nativeElement.innerHTML).toContain('1');
    expect(fixture.nativeElement.innerHTML).toContain('2');
    expect(fixture.nativeElement.innerHTML).toContain('3');

    // Let's simulate an emit.
    value$.next([]);
    fixture.detectChanges();

    // The numbers should disappear.
    expect(fixture.nativeElement.innerHTML).not.toContain('1');
    expect(fixture.nativeElement.innerHTML).not.toContain('2');
    expect(fixture.nativeElement.innerHTML).not.toContain('3');

    // Checking that a sibling method has been replaced
    // with a mock object too.
    expect(
      fixture.point.injector.get(TargetService).getValue$,
    ).toBeDefined();
    expect(
      fixture.point.injector.get(TargetService).getValue$(),
    ).toBeUndefined();
  });
});
```
