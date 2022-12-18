---
title: How to test a standalone component in Angular and mock its imports
description: Covering an Angular standalone component with tests
sidebar_label: Standalone Component
---

This section describes how to test a standalone component.

Usually, developers want to mock all dependencies.
For a standalone component, it means all its imports.
This behavior is possible to achieve with [`MockBuilder`](../api/MockBuilder.md#shallow-flag).

Let's image we have the next standalone component:

```ts
@Component({
  selector: 'target',
  template: `<dependency>{{ name | standalone }}</dependency>`,
  standalone: true,
  imports: [DependencyModule, StandalonePipe],
})
class StandaloneComponent {
  @Input() public readonly name: string | null = null;
}
```

As we can see, it imports `DependencyModule`, which provides `DependencyComponent`, and StandalonePipe,
and, ideally, they should be mocked.

The answer is:

```ts
beforeEach(() => {
  return MockBuilder(StandaloneComponent);
});
```

Under the hood it marks `StandaloneComponent` as [kept](../api/MockBuilder.md#keep)
and sets [shallow](../api/MockBuilder.md#shallow-flag) and [export](../api/MockBuilder.md#export-flag) flags:

```ts
beforeEach(() => {
  return MockBuilder().keep(StandaloneComponent, {
    shallow: true,
    export: true,
  });
});
```

That's it. Now all imports of `StandaloneComponent` are mocks,
and its properties, methods, injections and template are available for testing. 

If you need to keep an import, simply call [`.keep`](../api/MockBuilder.md#keep) with it.
For example, if we wanted to keep `StandalonePipe` then the code would look like:

```ts
beforeEach(() => {
  return MockBuilder(StandaloneComponent).keep(StandalonePipe);
});
```

## Live example

- [Try it on CodeSandbox](https://codesandbox.io/s/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=/src/examples/TestStandaloneComponent/test.spec.ts&initialpath=%3Fspec%3DTestStandaloneComponent)
- [Try it on StackBlitz](https://stackblitz.com/github/help-me-mom/ng-mocks-sandbox/tree/tests?file=src/examples/TestStandaloneComponent/test.spec.ts&initialpath=%3Fspec%3DTestStandaloneComponent)

```ts title="https://github.com/help-me-mom/ng-mocks/tree/master/examples/TestStandaloneComponent/test.spec.ts"
import {
  Component,
  Input,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

// A simple standalone pipe we are going to mock.
@Pipe({
  name: 'standalone',
  standalone: true,
})
class StandalonePipe implements PipeTransform {
  transform(value: string | null): string {
    return `${value}:${this.constructor.name}`;
  }
}

// A simple dependency component we are going to mock.
@Component({
  selector: 'dependency',
  template: '<ng-content></ng-content>',
})
class DependencyComponent {
  @Input() public readonly name: string | null = null;
}

// A module which declares and exports the dependency component.
@NgModule({
  declarations: [DependencyComponent],
  exports: [DependencyComponent],
})
class DependencyModule {}

// A standalone component we are going to test.
@Component({
  selector: 'standalone',
  template: `<dependency [name]="name">{{
    name | standalone
  }}</dependency>`,
  standalone: true,
  imports: [DependencyModule, StandalonePipe],
})
class StandaloneComponent {
  @Input() public readonly name: string | null = null;
}

describe('TestStandaloneComponent', () => {
  beforeEach(() => {
    return MockBuilder(StandaloneComponent);
  });

  it('renders dependencies', () => {
    const fixture = MockRender(StandaloneComponent, {
      name: 'test',
    });

    // asserting that we passed the input
    const dependencyComponent = ngMocks.findInstance(
      DependencyComponent,
    );
    expect(dependencyComponent.name).toEqual('test');

    // asserting how we called the pipe
    const standalonePipe = ngMocks.findInstance(StandalonePipe);
    // it's possible because of autoSpy.
    expect(standalonePipe.transform).toHaveBeenCalledWith('test');

    // or asserting the generated html
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<standalone ng-reflect-name="test"><dependency ng-reflect-name="test"></dependency></standalone>',
    );
  });
});
```
