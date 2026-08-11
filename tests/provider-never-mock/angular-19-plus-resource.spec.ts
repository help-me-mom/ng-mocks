import { ApplicationRef, Injectable, resource } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Injectable({ providedIn: 'root' })
class ResourceTarget {
  public resolve?: (value: number) => void;
  public readonly data = resource({
    loader: () =>
      new Promise<number>(resolve => {
        this.resolve = resolve;
      }),
  });
}

// @see https://github.com/help-me-mom/ng-mocks/issues/14613
// The EffectScheduler report exposed the same root-mocking problem for the
// Angular runtime services used by resource.
describe('provider-never-mock: Angular 19+ resource stability', () => {
  beforeEach(() => MockBuilder(ResourceTarget));

  it('waits for an unresolved resource loader', async () => {
    const target = ngMocks.findInstance(ResourceTarget);

    TestBed.inject(ApplicationRef).tick();
    let stable = false;
    const stability = TestBed.inject(ApplicationRef)
      .whenStable()
      .then(() => {
        stable = true;
      });
    await new Promise(resolve => setTimeout(resolve, 20));

    expect(stable).toBe(false);

    target.resolve?.(42);
    await stability;

    expect(stable).toBe(true);
  });
});
