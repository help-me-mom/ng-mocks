import { TestBed } from '@angular/core/testing';
import { DomSanitizer } from '@angular/platform-browser';
import { MockBuilder } from 'ng-mocks';

describe('issue-197:abstract', () => {
  const expected = {};
  beforeEach(() => MockBuilder().mock(DomSanitizer, expected));

  it('mocks abstract classes', () => {
    const actual = TestBed.get(DomSanitizer);
    expect(actual).toBe(expected);
  });
});
