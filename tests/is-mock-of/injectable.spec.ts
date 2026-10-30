import { Injectable } from '@angular/core';

import { isMockOf, MockService } from 'ng-mocks';

@Injectable()
class TargetService {
  public echo(): string {
    return 'real';
  }
}

describe('isMockOf:injectable', () => {
  it('recognizes and narrows a mocked injectable', () => {
    const instance: object = MockService(TargetService);

    expect(isMockOf(instance, TargetService, 'i')).toBe(true);
    if (isMockOf(instance, TargetService, 'i')) {
      expect(instance.echo()).toBeUndefined();
    }
    expect(isMockOf(new TargetService(), TargetService, 'i')).toBe(
      false,
    );
    expect(isMockOf(instance, TargetService, 'd')).toBe(false);
  });
});
