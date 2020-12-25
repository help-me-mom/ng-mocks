import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MockBuilder,
  MockInstance,
  MockReset,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class TargetService {
  protected name = 'target';

  public echo(): string {
    return this.name;
  }
}

describe('mock-instance-in-it', () => {
  beforeAll(() =>
    MockInstance(TargetService, () => ({
      echo: () => 'beforeAll',
    })),
  );

  afterAll(() => {
    // need to call it remove cached TargetService.
    ngMocks.flushTestBed();

    const actual = TestBed.get(TargetService).echo();
    expect(actual).toEqual('beforeAll');

    MockReset();
  });

  beforeEach(() => MockBuilder().mock(TargetService));

  beforeEach(() =>
    MockInstance(TargetService, () => ({
      echo: () => 'beforeEach',
    })),
  );

  it('overrides in the 1st it', () => {
    MockInstance(TargetService, () => ({
      echo: () => 'it',
    }));

    const actual = TestBed.get(TargetService).echo();
    expect(actual).toEqual('it');
  });

  it('uses beforeEach in the 2nd it', () => {
    const actual = TestBed.get(TargetService).echo();
    expect(actual).toEqual('beforeEach');
  });
});
