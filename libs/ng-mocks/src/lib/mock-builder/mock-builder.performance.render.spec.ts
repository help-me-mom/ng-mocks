import { NgModule } from '@angular/core';

import { ngMocks } from '../mock-helper/mock-helper';

import { MockBuilder } from './mock-builder';

@NgModule({})
class Target1Module {}

describe('MockBuilderPerformance:render', () => {
  afterEach(ngMocks.reset);

  it('reuses the cache for the same render options object', () => {
    const render = {};
    const ngModule1 = MockBuilder()
      .mock(Target1Module, { render })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, { render })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when rendering is enabled or disabled', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, { render: true })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, { render: false })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when render variables are added', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, { render: {} })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {},
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when the implicit render value changes', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          $implicit: true,
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          $implicit: false,
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('reuses the cache for the same render variables object', () => {
    const variables = {};
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables,
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables,
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('reuses the cache for equal render variable values', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
          },
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
          },
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).toBe(ngModule2.providers?.[0]);
  });
  it('invalidates the cache when render variables are added or removed', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, { render: {} })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 2,
          },
        },
      })
      .build();
    const ngModule3 = MockBuilder()
      .mock(Target1Module, { render: {} })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
    expect(ngModule2.providers?.[0]).not.toBe(
      ngModule3.providers?.[0],
    );
  });
  it('invalidates the cache when render variable names change', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
          },
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
            key: false,
          },
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when render variable values change', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 1,
          },
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          variables: {
            flag: 2,
          },
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when the number of render blocks changes', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          block1: {},
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          block1: {},
          block2: {},
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
  it('invalidates the cache when a render block definition changes', () => {
    const ngModule1 = MockBuilder()
      .mock(Target1Module, {
        render: {
          block1: {
            $implicit: true,
          },
        },
      })
      .build();
    const ngModule2 = MockBuilder()
      .mock(Target1Module, {
        render: {
          block1: {
            $implicit: false,
          },
        },
      })
      .build();

    expect(ngModule1.providers?.[0]).not.toBe(
      ngModule2.providers?.[0],
    );
  });
});
