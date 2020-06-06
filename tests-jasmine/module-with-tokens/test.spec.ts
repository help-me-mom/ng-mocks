import { MockBuilder, MockRender } from 'ng-mocks';

import { MY_TOKEN_MULTI, MY_TOKEN_SINGLE, TargetComponent, TargetModule } from './fixtures';

// Because all tokens are provided in the module the test should render them correctly.
describe('module-with-tokens:real', () => {
  beforeEach(() => MockBuilder().keep(TargetModule));

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('"MY_TOKEN_SINGLE" [ "MY_TOKEN_MULTI", "MY_TOKEN_MULTI_2" ]');
  });
});

// Because all tokens are kept in the module the test should render them correctly.
describe('module-with-tokens:keep', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(MY_TOKEN_SINGLE).keep(MY_TOKEN_MULTI));

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('"MY_TOKEN_SINGLE" [ "MY_TOKEN_MULTI", "MY_TOKEN_MULTI_2" ]');
  });
});

// Preferred way.
// Because tokens are provided in the testbed module with custom values the test should render them.
describe('module-with-tokens:mock-0', () => {
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
      .provide({
        multi: true,
        provide: MY_TOKEN_MULTI,
        useValue: 'V3',
      })
  );

  it('fails to render all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('"V1" [ "V2", "V3" ]');
  });
});

// Because all tokens are mocked in the module the test should render empty values.
// interesting is that for multi it's null, not undefined.
describe('module-with-tokens:mock-1', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).mock(MY_TOKEN_SINGLE).mock(MY_TOKEN_MULTI));

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual('[ null, null ]');
  });
});

// Because all tokens are mocked in the module with custom values the test should render them.
describe('module-with-tokens:mock-2', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .mock(MY_TOKEN_SINGLE, 'MOCKED_MY_TOKEN_SINGLE')
      .mock(MY_TOKEN_MULTI, 'MOCKED_MY_TOKEN_MULTI')
  );

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerText).toEqual(
      '"MOCKED_MY_TOKEN_SINGLE" [ "MOCKED_MY_TOKEN_MULTI", "MOCKED_MY_TOKEN_MULTI" ]'
    );
  });
});

// And the most complicated case. Because we don't touch tokens at all and mock the module
// the tokens will be omitted from the final mock and injection will fail.
// Unfortunately it's quite tough to guess which tokens we can keep, mocks or omit and now
// a user is responsible to specify tokens for his mock.
describe('module-with-tokens:mock-3', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('fails to render all tokens', () => {
    expect(() => MockRender(TargetComponent)).toThrowError(/InjectionToken/);
  });
});
