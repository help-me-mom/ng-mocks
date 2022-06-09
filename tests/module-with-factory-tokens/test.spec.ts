import { VERSION } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

import {
  MY_TOKEN_MULTI,
  MY_TOKEN_SINGLE,
  TargetComponent,
  TargetModule,
} from './fixtures';

// Because all tokens have factories the test should render them correctly.
// There is no way to specify multi in a factory, so we do not get an array.
describe('module-with-factory-tokens:real', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder()
      .keep(TargetModule)
      .keep(MY_TOKEN_SINGLE)
      .keep(MY_TOKEN_MULTI),
  );

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-component>"MY_TOKEN_SINGLE" "MY_TOKEN_MULTI"</internal-component>',
    );
  });
});

// Because all tokens are kept the test should render them correctly.
// There is no way to specify multi in a factory, so we do not get an array.
describe('module-with-factory-tokens:keep', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder(
      [TargetComponent, MY_TOKEN_SINGLE, MY_TOKEN_MULTI],
      TargetModule,
    ),
  );

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-component>"MY_TOKEN_SINGLE" "MY_TOKEN_MULTI"</internal-component>',
    );
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
      }),
  );

  it('fails to render all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(ngMocks.formatHtml(fixture)).toContain('"V1" [ "V2" ]');
  });
});

// Because all tokens are replaced with mock copies in the module the test should render empty values.
// The tokens will be added to provides with undefined values.
// Result of the render is an empty string because there is no way to pass multi.
describe('module-with-factory-tokens:mock-1', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, [
      TargetModule,
      MY_TOKEN_SINGLE,
      MY_TOKEN_MULTI,
    ]),
  );

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<internal-component></internal-component>',
    );
  });
});

// Because all tokens are replaced with mock copies with custom values the test should render them.
// There is no way to specify multi in a factory, so we do not get an array.
describe('module-with-factory-tokens:mock-2', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule)
      .mock(MY_TOKEN_SINGLE, 'MOCK_MY_TOKEN_SINGLE', { export: true })
      .mock(MY_TOKEN_MULTI, 'MOCK_MY_TOKEN_MULTI', { export: true }),
  );

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-component>"MOCK_MY_TOKEN_SINGLE" "MOCK_MY_TOKEN_MULTI"</internal-component>',
    );
  });
});

// And the most interesting case. Because we do not touch tokens at all and mock the module
// the tokens will used as they are with their factories.
// Unfortunately, it is quite tough to guess which tokens we can keep, mocks or omit and now
// a user is responsible to specify tokens for his mock.
// UPD 2020-10-28: it has been fixed. Now all missed tokens are added to the TestModuleMeta,
// therefore we have to keep them.
describe('module-with-factory-tokens:mock-3', () => {
  if (Number.parseInt(VERSION.major, 10) <= 5) {
    it('a5', () => {
      // pending('Need Angular > 5');
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() =>
    MockBuilder(
      [TargetComponent, MY_TOKEN_SINGLE, MY_TOKEN_MULTI],
      TargetModule,
    ),
  );

  it('renders all tokens', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture.nativeElement.innerHTML).toEqual(
      '<internal-component>"MY_TOKEN_SINGLE" "MY_TOKEN_MULTI"</internal-component>',
    );
  });
});
