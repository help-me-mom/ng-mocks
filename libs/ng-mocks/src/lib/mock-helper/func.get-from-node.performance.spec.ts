import { Injector } from '@angular/core';

import funcGetFromNode from './func.get-from-node';

describe('func.get-from-node:performance', () => {
  class Service {}

  it('skips view discovery after a successful first-result injector lookup', () => {
    const instance = new Service();
    const context = jasmine
      .createSpy('view context')
      .and.returnValue([]);
    const node = {
      injector: Injector.create({
        providers: [{ provide: Service, useValue: instance }],
      }),
      nativeNode: {
        get __ngContext__() {
          return context();
        },
      },
      parent: null,
    };

    const result = funcGetFromNode(
      [],
      node as never,
      Service,
      'first',
    );

    expect(result.length).toBe(1);
    expect(result[0]).toBe(instance);
    expect(context).not.toHaveBeenCalled();
  });

  it('keeps exhaustive discovery after the same injector hit', () => {
    const provided = new Service();
    const rendered = new Service();
    const node = {
      injector: Injector.create({
        providers: [{ provide: Service, useValue: provided }],
      }),
      nativeNode: { __ngContext__: [rendered] },
      parent: null,
    };

    const result = funcGetFromNode([], node as never, Service);

    expect(result.length).toBe(2);
    expect(result[0]).toBe(provided);
    expect(result[1]).toBe(rendered);
  });

  it('keeps view fallback and its first result when the injector misses', () => {
    const first = new Service();
    const second = new Service();
    const node = {
      injector: Injector.create({ providers: [] }),
      nativeNode: { __ngContext__: [first, second] },
      parent: null,
    };

    const result = funcGetFromNode(
      [],
      node as never,
      Service,
      'first',
    );

    expect(result[0]).toBe(first);
  });
});
