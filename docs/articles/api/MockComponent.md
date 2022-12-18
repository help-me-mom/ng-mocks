---
title: How to mock components in Angular tests
description: Information how to mock components in Angular tests with help of ng-mocks
sidebar_label: MockComponent
---

**A mock component in Angular tests** can be created by `MockComponent` function.
The mock component respects the interface of its original component,
but all its methods are dummies.

To create a mock component, simply pass its class into `MockComponent` function.

```ts
TestBed.configureTestingModule({
  declarations: [
    // for a single component
    MockComponent(Component),

    // for a set of components
    ...MockComponents(Component1, Component2),
  ],
});
```

The class of a mock component has:

- the same `selector`
- the same `@Inputs` and `@Outputs` with alias support
- templates with pure `<ng-content>` tags to allow transclusion
- support for `@ContentChild` and `@ContentChildren`
- support for `ControlValueAccessor`, `Validator` and `AsyncValidator`
- support for `exportAs`
- support for [standalone components](#standalone-components)

:::tip
Information about mocking FormControl, ControlValueAccessor, Validator and AsyncValidator
is in [a different section](../extra/mock-form-controls.md).
:::

## Simple example

Let's pretend that in our Angular application `TargetComponent` depends on a child component of `DependencyComponent`
and we want to use its mock object in a test.

Usually `beforeEach` looks like:

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
        DependencyComponent,
      ],
    });

    fixture = TestBed.createComponent(TargetComponent);
    component = fixture.componentInstance;
  });
});
```

To **create a mock child component**, simply pass its class into `MockComponent`:

```ts
TestBed.configureTestingModule({
  declarations: [
    TargetComponent,

    // profit
    MockComponent(DependencyComponent),
  ],
});
```

Or be like a pro and use [`MockBuilder`](MockBuilder.md), its [`.mock`](MockBuilder.md#mock) method
and [`MockRender`](MockRender.md):

```ts
describe('Test', () => {
  beforeEach(() => {
    // DependencyComponent is a declaration or imported somewhere in ItsModule.
    return MockBuilder(TargetComponent, ItsModule);
  });

  it('should create', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });
});
```

## Standalone components

Starting Angular 14, it provides support for standalone components.
They are supported by `ng-mocks`. To mock a standalone component, you need to call `MockComponent` in imports:

```ts
TestBed.configureTestingModule({
  imports: [
    // for a single component
    MockComponent(StandaloneComponent),

    // for a set of components
    ...MockComponents(Standalone1Component, Standalone2Component),
  ],
  declarations: [
    // our component for testing
    TargetComponent,
  ],
});
```

[`MockBuilder`](./MockBuilder.md) also supports standalone components
and allows to mock their imports only for shallow rendering.

## Advanced example

An advanced example about **mocking components**.
Please, pay attention to comments in the code.

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/MockComponent/test.spec.ts&initialpath=%3Fspec%3DMockComponent)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/MockComponent/test.spec.ts&initialpath=%3Fspec%3DMockComponent)

```ts title="https://github.com/help-me-mom/ng-mocks/blob/master/examples/MockComponent/test.spec.ts"
describe('MockComponent', () => {
  beforeEach(() => {
    return MockBuilder(MyComponent, ItsModule);
  });

  it('sends the correct value to the child input', () => {
    const fixture = MockRender(MyComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.css('app-child')
    // ).componentInstance
    // but properly typed.
    const mockComponent =
      ngMocks.find<DependencyComponent>(
        'app-child',
      ).componentInstance;

    // Let's pretend that DependencyComponent has 'someInput' as
    // an input. MyComponent sets its value via
    // `[someInput]="value"`. The input's value will be passed into
    // the mock component so we can assert on it.
    component.value = 'foo';
    fixture.detectChanges();

    // Thanks to ng-mocks, this is type safe.
    expect(mockComponent.someInput).toEqual('foo');
  });

  it('does something on an emit of the child component', () => {
    const fixture = MockRender(MyComponent);
    const component = fixture.point.componentInstance;

    // The same as
    // fixture.debugElement.query(
    //   By.directive(DependencyComponent)
    // ).componentInstance
    // but properly typed.
    const mockComponent = ngMocks.findInstance(DependencyComponent);

    // Again, let's pretend DependencyComponent has an output
    // called 'someOutput'. MyComponent listens on the output via
    // `(someOutput)="trigger($event)"`.
    // Let's install a spy and trigger the output.
    ngMocks.stubMember(
      component,
      'trigger',
      typeof jest === 'undefined' ? jasmine.createSpy() : jest.fn(),
    );
    mockComponent.someOutput.emit({
      payload: 'foo',
    });

    // Assert on the effect.
    expect(component.trigger).toHaveBeenCalledWith({
      payload: 'foo',
    });
  });

  it('renders something inside of the child component', () => {
    const localFixture = MockRender<DependencyComponent>(`
      <app-child>
        <p>inside content</p>
      </app-child>
    `);

    // We can access html directly asserting on some side effect.
    const mockNgContent = localFixture.point.nativeElement.innerHTML;
    expect(mockNgContent).toContain('<p>inside content</p>');
  });

  it('renders ContentChild of the child component', () => {
    const fixture = MockRender<DependencyComponent>(`
      <app-child>
        <ng-template #something>
          <p>inside template</p>
        </ng-template>
        <p>inside content</p>
      </app-child>
    `);

    // Injected ng-content rendered everything except templates.
    const mockNgContent = fixture.point.nativeElement.innerHTML;
    expect(mockNgContent).toContain('<p>inside content</p>');
    expect(mockNgContent).not.toContain('<p>inside template</p>');

    // Let's render the template. First, we need to assert that
    // componentInstance is a MockedComponent<T> to access
    // its `__render` method. `isMockOf` function helps here.
    const mockComponent = fixture.point.componentInstance;
    ngMocks.render(
      mockComponent,
      ngMocks.findTemplateRef('something'),
    );

    // The rendered template is wrapped by <div data-key="something">.
    // We can use this selector to assert exactly its content.
    const mockNgTemplate = ngMocks.find(DependencyComponent)
      .nativeElement.innerHTML;
    expect(mockNgTemplate).toContain('<p>inside template</p>');
  });
});
```
