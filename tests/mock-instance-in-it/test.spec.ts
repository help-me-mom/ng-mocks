import { Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockInstance } from 'ng-mocks';

@Injectable()
class TargetService {
  protected name = 'target';

  public echo(): string {
    return this.name;
  }
}

describe('mock-instance-in-it', () => {
  MockInstance.scope('suite');
  beforeAll(() =>
    MockInstance(TargetService, () => ({
      echo: () => 'beforeAll',
    })),
  );

  beforeEach(() => MockBuilder().mock(TargetService));

  describe('scoped beforeEach', () => {
    MockInstance.scope('case');
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

  it('receives default value', () => {
    const actual = TestBed.get(TargetService).echo();
    expect(actual).toEqual('beforeAll');
  });
});
