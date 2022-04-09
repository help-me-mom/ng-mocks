import { Injectable } from '@angular/core';

import { MockBuilder, MockInstance, MockRender } from 'ng-mocks';

@Injectable()
class TargetService {
  protected name = 'target';

  public echo(): string {
    return this.name;
  }
}

describe('mock-instance-scope', () => {
  MockInstance.scope('suite');
  beforeAll(() =>
    MockInstance(TargetService, () => ({
      echo: () => 'beforeAll',
    })),
  );

  beforeEach(() => MockBuilder().mock(TargetService));

  it('uses beforeAll in the 2nd it', () => {
    const actual =
      MockRender(TargetService).point.componentInstance.echo();
    expect(actual).toEqual('beforeAll');
  });

  describe('nested', () => {
    MockInstance.scope();
    beforeEach(() =>
      MockInstance(TargetService, () => ({
        echo: () => 'beforeEach',
      })),
    );

    it('uses beforeEach in the 2nd it', () => {
      const actual =
        MockRender(TargetService).point.componentInstance.echo();
      expect(actual).toEqual('beforeEach');
    });

    it('uses it in the 3rd it', () => {
      MockInstance(TargetService, () => ({
        echo: () => 'it',
      }));
      const actual =
        MockRender(TargetService).point.componentInstance.echo();
      expect(actual).toEqual('it');
    });

    it('uses beforeEach in the 4th it', () => {
      const actual =
        MockRender(TargetService).point.componentInstance.echo();
      expect(actual).toEqual('beforeEach');
    });
  });

  it('uses beforeAll in the 5th it', () => {
    const actual =
      MockRender(TargetService).point.componentInstance.echo();
    expect(actual).toEqual('beforeAll');
  });
});
