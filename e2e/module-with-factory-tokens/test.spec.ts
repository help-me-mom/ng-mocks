import { VERSION } from '@angular/core';

import { MockBuilder } from '../../lib/mock-builder';
import { MockRender } from '../../lib/mock-render';

import { MY_TOKEN_MULTI, MY_TOKEN_SINGLE, TargetComponent, TargetModule } from './fixtures';

// Because all tokens have factories the test should render them correctly.
// There's no way to specify multi in a factory, so we don't get an array.
describe('module-with-factory-tokens:real', () => {
  beforeEach(() => MockBuilder().keep(TargetModule));

  it('renders all tokens', () => {
    // tslint:disable-next-line:no-magic-numbers
    if (parseInt(VERSION.major, 10) <= 5) {
      pending('Need Angular > 5');
      return;
    }

    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('"MY_TOKEN_SINGLE" "MY_TOKEN_MULTI"');
  });
});

// Because all tokens are kept the test should render them correctly.
// There's no way to specify multi in a factory, so we don't get an array.
describe('module-with-factory-tokens:keep', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(MY_TOKEN_SINGLE).keep(MY_TOKEN_MULTI));

  it('renders all tokens', () => {
    // tslint:disable-next-line:no-magic-numbers
    if (parseInt(VERSION.major, 10) <= 5) {
      pending('Need Angular > 5');
      return;
    }

    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('"MY_TOKEN_SINGLE" "MY_TOKEN_MULTI"');
  });
});

// Preferred way.
// Because tokens are provided in the testbed module with custom values the test should render them.
describe('module-with-factory-tokens:mock-0', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .provide({
        provide: MY_TOKEN_SINGLE,
        useValue: 'V1',
      })
      .provide({
        multi: true,
        provide: MY_TOKEN_MULTI,
        useValue: 'V2',
      })
  );

  it('fails to render all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('"V1" [ "V2" ]');
  });
});

// Because all tokens are mocked in the module the test should render empty values.
// The tokens will be added to provides with undefined values.
// Result of the render is an empty string because there's no way to pass multi.
describe('module-with-factory-tokens:mock-1', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).mock(MY_TOKEN_SINGLE).mock(MY_TOKEN_MULTI));

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('');
  });
});

// Because all tokens are mocked with custom values the test should render them.
// There's no way to specify multi in a factory, so we don't get an array.
describe('module-with-factory-tokens:mock-2', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .mock(MY_TOKEN_SINGLE, 'MOCKED_MY_TOKEN_SINGLE')
      .mock(MY_TOKEN_MULTI, 'MOCKED_MY_TOKEN_MULTI')
  );

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('"MOCKED_MY_TOKEN_SINGLE" "MOCKED_MY_TOKEN_MULTI"');
  });
});

// And the most interesting case. Because we don't touch tokens at all and mock the module
// the tokens will used as they are with their factories.
// Unfortunately it's quite tough to guess which tokens we can keep, mocks or omit and now
// a user is responsible to specify tokens for his mock.
describe('module-with-factory-tokens:mock-3', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('renders all tokens', () => {
    // tslint:disable-next-line:no-magic-numbers
    if (parseInt(VERSION.major, 10) <= 5) {
      pending('Need Angular > 5');
      return;
    }

    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('"MY_TOKEN_SINGLE" "MY_TOKEN_MULTI"');
  });
});
