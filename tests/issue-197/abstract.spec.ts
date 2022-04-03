import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MockBuilder } from 'ng-mocks';

// @see https://github.com/ike18t/ng-mocks/issues/197
describe('issue-197:abstract', () => {
  const expected = {};
  beforeEach(() => {
    return MockBuilder().mock(DomSanitizer, expected, {
      precise: true,
    });
  });

  it('mocks abstract classes', () => {
    const actual = TestBed.get(DomSanitizer);
    expect(actual).toBe(expected);
  });
});
