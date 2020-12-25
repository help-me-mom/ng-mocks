import { MockInstance } from 'ng-mocks';

class TargetService {
  protected name = 'target';

  public echo1(): string {
    return this.name;
  }

  public echo2(): string {
    return this.name;
  }
}

// Accepts valid type.
MockInstance(TargetService, () => ({
  echo1: () => 'mock',
}));
// Accepts valid type.
MockInstance(TargetService, {
  init: () => ({
    echo2: () => 'mock',
  }),
});
// Accepts internal change.
MockInstance(TargetService, instance => {
  instance.echo1 = () => 'mock';
});
// Accepts internal change.
MockInstance(TargetService, {
  init: instance => {
    instance.echo1 = () => 'mock';
  },
});
// Accepts reset.
MockInstance(TargetService);

// @ts-expect-error: does not support wrong types.
MockInstance(TargetService, () => true);
// @ts-expect-error: does not support wrong types.
MockInstance(TargetService, () => ({
  prop: 123,
}));
MockInstance(TargetService, {
  // @ts-expect-error: does not support wrong types.
  init: () => ({
    prop: 123,
  }),
});
