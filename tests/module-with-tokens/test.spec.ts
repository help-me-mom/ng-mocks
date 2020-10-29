import { MockBuilder, MockRender } from 'ng-mocks';

import { MY_TOKEN_MULTI, MY_TOKEN_SINGLE, TargetComponent, TargetModule } from './fixtures';

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
    expect(fixture.nativeElement.innerHTML.replace(/\s+/gm, ' ')).toEqual(
      '<internal-component>"V1" [ "V2", "V3" ]</internal-component>'
    );
  });
});

// Because all tokens are mocked in the module the test should render empty values.
// interesting is that for multi it's null, not undefined.
describe('module-with-tokens:mock-1', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).mock(MY_TOKEN_SINGLE).mock(MY_TOKEN_MULTI));

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML.replace(/\s+/gm, ' ')).toEqual(
      '<internal-component> [ null, null ]</internal-component>'
    );
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
    expect(fixture.nativeElement.innerHTML.replace(/\s+/gm, ' ')).toEqual(
      '<internal-component>"MOCKED_MY_TOKEN_SINGLE" [ "MOCKED_MY_TOKEN_MULTI", "MOCKED_MY_TOKEN_MULTI" ]</internal-component>'
    );
  });
});

// And the most complicated case. Because we don't touch tokens at all and mock the module
// the tokens will be omitted from the final mock and injection will fail.
// Unfortunately it's quite tough to guess which tokens we can keep, mocks or omit and now
// a user is responsible to specify tokens for his mock.
// UPD 2020-10-28: it has been fixed. Now all missed tokens are added to the TestModuleMeta.
describe('module-with-tokens:mock-3', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('does not fail to render all tokens', () => {
    expect(() => MockRender(TargetComponent)).not.toThrowError(/InjectionToken/);
  });

  it('renders mocked tokens with respect of multi flag', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toContain('[]');
  });
});

//There is a sequential failure, real and keep should be after mocked versions.

// Because all tokens are provided in the module the test should render them correctly.
describe('module-with-tokens:real', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML.replace(/\s+/gm, ' ')).toEqual(
      '<internal-component>"MY_TOKEN_SINGLE" [ "MY_TOKEN_MULTI", "MY_TOKEN_MULTI_2" ]</internal-component>'
    );
  });
});

// Because all tokens are kept in the module the test should render them correctly.
describe('module-with-tokens:keep', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule).keep(MY_TOKEN_SINGLE).keep(MY_TOKEN_MULTI));

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML.replace(/\s+/gm, ' ')).toEqual(
      '<internal-component>"MY_TOKEN_SINGLE" [ "MY_TOKEN_MULTI", "MY_TOKEN_MULTI_2" ]</internal-component>'
    );
  });
});
