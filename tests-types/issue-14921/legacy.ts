import { InjectionToken, Injector } from '@angular/core';

import { MockInstance, MockInstanceClassConfig, MockInstanceTokenConfig } from '../../dist/libs/ng-mocks/index';

/** @see https://github.com/help-me-mom/ng-mocks/issues/14921 */
class TargetService {
  public name = '';

  public update(value: number): string {
    return String(value);
  }
}

const token = new InjectionToken<TargetService>('target');

// Deprecating a function overload must not contaminate its merged namespace.
MockInstance.scope();
MockInstance.scope('case');
MockInstance.scope('suite');
MockInstance.scope('all');
MockInstance.remember();
MockInstance.restore();
MockInstance(TargetService);
MockInstance(token);

MockInstance(TargetService, (instance, injector) => {
  const service: TargetService = instance;
  const source: Injector | undefined = injector;
  service.name = source ? source.get(token).name : 'mock';
});
MockInstance(TargetService, () => ({ name: 'mock' }));
MockInstance(token, (instance, injector) => {
  const service: TargetService | undefined = instance;
  const source: Injector | undefined = injector;
  // @ts-expect-error The token instance can be undefined.
  instance.name;

  return { name: service?.name ?? source?.get(token).name ?? 'mock' };
});

export const property: 'mock' = MockInstance(TargetService, 'name', 'mock');
export const method: (value: number) => string = MockInstance(TargetService, 'update', value => String(value));
export const getter: () => string = MockInstance(TargetService, 'name', () => 'mock', 'get');
// @ts-expect-error The returned method retains its numeric parameter type.
MockInstance(TargetService, 'update', value => String(value))(false);
// @ts-expect-error The returned getter retains its string result type.
MockInstance(TargetService, 'name', () => 'mock', 'get')().toFixed();
export const setter: (value: string) => void = MockInstance(
  TargetService,
  'name',
  value => {
    const name: string = value;
    MockInstance(TargetService, 'name', name);
  },
  'set',
);

const classConfig: MockInstanceClassConfig<TargetService> = {
  init: instance => {
    instance.name = 'mock';
  },
};
const tokenConfig: MockInstanceTokenConfig<TargetService> = {
  init: () => ({ name: 'mock' }),
};
MockInstance(TargetService, classConfig);
MockInstance(token, tokenConfig);

// Object-literal keys are declarations; read the members to verify their deprecation.
// eslint-disable-next-line @typescript-eslint/no-deprecated -- The legacy init member must remain deprecated.
MockInstance(TargetService, classConfig.init);
// eslint-disable-next-line @typescript-eslint/no-deprecated -- The token init member must remain deprecated.
MockInstance(token, tokenConfig.init);
