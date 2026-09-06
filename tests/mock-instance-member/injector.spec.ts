import {
  createEnvironmentInjector,
  EnvironmentInjector,
  Injectable,
  Injector,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockInstance, MockProvider } from 'ng-mocks';

@Injectable()
class TargetService {
  public value = 'real';
}

describe('mock-instance-member:injector', () => {
  MockInstance.scope();

  it('releases only the mocks owned by a destroyed injector', () => {
    TestBed.configureTestingModule({});
    const parent = TestBed.inject(EnvironmentInjector);
    const first = createEnvironmentInjector(
      [MockProvider(TargetService)],
      parent,
    );
    const second = createEnvironmentInjector(
      [MockProvider(TargetService)],
      parent,
    );
    const destroyed = first.get(TargetService);
    const live = second.get(TargetService);
    const injectors: Array<Injector | undefined> = [];

    try {
      MockInstance(TargetService, (instance, injector) => {
        injectors.push(injector);
        instance.value = 'before';
      });
      expect(injectors).toEqual([first, second]);

      first.destroy();
      MockInstance(TargetService, 'value', 'after');

      expect(destroyed.value).toEqual('before');
      expect(live.value).toEqual('after');
      expect(second.get(TargetService)).toBe(live);
    } finally {
      second.destroy();
    }
  });
});
