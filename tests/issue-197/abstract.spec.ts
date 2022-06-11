import { DomSanitizer } from '@angular/platform-browser';

import { MockBuilder, ngMocks } from 'ng-mocks';

// @see https://github.com/ike18t/ng-mocks/issues/197
describe('issue-197:abstract', () => {
  const expected = {};
  beforeEach(() => {
    return MockBuilder().mock(DomSanitizer, expected, {
      precise: true,
    });
  });

  it('mocks abstract classes', () => {
    const actual = ngMocks.findInstance<any>(DomSanitizer);
    expect(actual).toBe(expected);
  });
});
