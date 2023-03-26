---
title: How to mock directives in Angular tests
description: Information how to mock attribute and structural directives in Angular tests with help of ng-mocks
sidebar_label: MockDirective
---

**A mock directive in Angular tests** can be created by `MockDirective` function.
The mock directive has the same interface as its original directive,
but all its methods are dummies.

In order to create a mock directive, pass the original directive into `MockDirective` function.

```ts
TestBed.configureTestingModule({
  declarations: [
    // for a single directive
    MockDirective(Directive),

    // for a set of directives
    ...MockDirectives(Directive1, Directive2),
  ],
});
```

A mock directive has:

- support for attribute and structural directives
- the same `selector`
- the same `Inputs` and `Outputs` with alias support
- support for `@ContentChild` and `@ContentChildren`
- support for `ControlValueAccessor`, `Validator` and `AsyncValidator`
- supports `exportAs`
- support for [standalone directives](#standalone-directives)

:::tip
Information about mocking FormControl, ControlValueAccessor, Validator and AsyncValidator
is in [a different section](/extra/mock-form-controls.md).
:::

## Simple example

Let's assume that an Angular application has `TargetComponent` that depends on `DependencyDirective` directive,
and we would like to use its mock object in order to facilitate unit tests.

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
        DependencyDirective,
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To turn a directive into **a mock directive**, simply pass its original class into `MockDirective`:

```ts
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,

    // profit
    MockDirective(DependencyDirective),
  ],
});
```

Or be like a pro and use [`MockBuilder`](MockBuilder.md), its [`.mock`](MockBuilder.md#mock) method
and [`MockRender`](MockRender.md):

```ts
describe('Test', () => {
  beforeEach(() => {
    // DependencyDirective is a declaration or imported somewhere in ItsModule.
    return MockBuilder(TargetComponent, ItsModule);
  });

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

## Standalone directives

Angular 14 has introduced support for standalone directives.
`ng-mocks` recognizes and properly mocks them.
To mock a standalone directive, you need to call `MockDirective` in imports:

```ts
TestBed.configureTestingModule({
  imports: [
    // for a single directive
    MockDirective(StandaloneDirective),

    // for a set of directives
    ...MockDirectives(Standalone1Directive, Standalone2Directive),
  ],
  declarations: [
    // our component for testing
    TargetComponent,
  ],
});
```

[`MockBuilder`](MockBuilder.md) recognizes and handles standalone directives.
Also, it allows to mock their imports only for shallow testing.

## Advanced example with attribute directives

An advanced example about **mocking attribute directives**.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockDirective-Attribute/test.spec.ts&initialpath=%3Fspec%3DMockDirective%3AAttribute)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockDirective-Attribute/test.spec.ts&initialpath=%3Fspec%3DMockDirective%3AAttribute)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockDirective-Attribute/test.spec.ts"
describe('MockDirective:Attribute', () => {
  beforeEach(() => {
    // DependencyDirective is a declaration in ItsModule.
    return MockBuilder(TargetComponent, ItsModule);
  });

  it('sends the correct value to the input', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockDirective = ngMocks.get(
      ngMocks.find('span'),
      DependencyDirective,
    );

    // Let's pretend DependencyDirective has 'someInput'
    // as an input. MyComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mock directive, so we can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ng-mocks, this is type safe.
    expect(mockDirective.someInput).toEqual('foo');
  });

  it('does something on an emit of the child directive', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('span')
    // ).injector.get(DependencyDirective)
    // but easier and more precise.
    const mockDirective = ngMocks.get(
      ngMocks.find('span'),
      DependencyDirective,
    );

    // Again, let's pretend DependencyDirective has an output called
    // 'someOutput'. MyComponent listens on the output via
    // `(someOutput)="trigger()"`.
    // Let's install a spy and trigger the output.
    ngMocks.stubMember(
      component,
      'trigger',
      jasmine.createSpy(), // or jest.fn()
    );
    mockDirective.someOutput.emit();

    // Assert on the effect.
    expect(component.trigger).toHaveBeenCalled();
  });
});
```

## Advanced example with structural directives

An advanced example of **mocking structural directives** in Angular tests.
Please, pay attention to comments in the code.

:::important
It is important to render a structural directive with the right context first,
if we want to assert on its nested elements.
:::

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockDirective-Structural/test.spec.ts&initialpath=%3Fspec%3DMockDirective%3AStructural)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockDirective-Structural/test.spec.ts&initialpath=%3Fspec%3DMockDirective%3AStructural)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockDirective-Structural/test.spec.ts"
describe('MockDirective:Structural', () => {
  // IMPORTANT: by default structural directives are not rendered.
  // Because they might require a context which should be provided.
  // Usually a developer knows the context and can render it
  // manually with proper setup.
  beforeEach(() => {
    // DependencyDirective is a declaration in ItsModule.
    return MockBuilder(TargetComponent, ItsModule).mock(
      DependencyDirective,
      {
        // render: true, // <-- a flag to render the directive by default
      },
    );
  });

  it('renders content of the child structural directive', () => {
    const fixture = MockRender(TargetComponent);

    // Let's assert that nothing has been rendered inside
    // the structural directive by default.
    expect(fixture.nativeElement.innerHTML).not.toContain('>content<');

    // And let's render it manually now.
    const mockDirective = ngMocks.findInstance(DependencyDirective);
    ngMocks.render(mockDirective, mockDirective);

    // The content of the structural directive should be rendered.
    expect(fixture.nativeElement.innerHTML).toContain('>content<');
  });
});
```
