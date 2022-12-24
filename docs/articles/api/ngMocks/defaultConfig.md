---
title: ngMocks.defaultConfig
description: Documentation about ngMocks.defaultConfig from ng-mocks library
---

Sets default config for mocks in [`MockBuilder`](/api/MockBuilder.md#config).

- `ngMocks.defaultConfig( Component, config )` - sets a default config for a component
- `ngMocks.defaultConfig( Directive, config )` - sets a default config for a directive
- `ngMocks.defaultConfig( Component )` - removes config
- `ngMocks.defaultConfig( Directive )` - removes config

The best place to do that is in `src/test.ts` for jasmine or in `src/setup-jest.ts` / `src/test-setup.ts` for `jest`.

For example, if you have a simple structural directive which you always want to render it.
Then, you can configure it via `ngMocks.defaultConfig`.

```ts title="src/test.ts"
// Config for a structural directive.
ngMocks.defaultConfig(StructuralDirective, {
  // render the mock of the directive by default
  render: true,
});

// Config for a component with content views.
ngMocks.defaultConfig(ViewComponent, {
  render: {
    // render a block by default
    block1: true,
    
    // render a block with context
    block2: {
      $implicit: {
        data: 'MOCK_DATA',
      },
    },
  },
});

// removing the config.
ngMocks.defaultMock(StructuralDirective);
```
