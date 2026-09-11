import { QueryList, ViewContainerRef } from '@angular/core';

import { NG_MOCKS } from './core.tokens';
import './ng-mocks-global-overrides';

// @see https://github.com/help-me-mom/ng-mocks/issues/14910
describe('ng-mocks-global-overrides:query containers', () => {
  it('patches a query-first container before exposing it to consumers', () => {
    class RealComponent {}
    class MockComponent {}

    // Use an isolated concrete prototype so another suite cannot warm this path.
    const prototype = Object.create(ViewContainerRef.prototype);
    Object.defineProperty(prototype, 'constructor', {
      value: { prototype },
    });
    const createComponent = jasmine.createSpy('createComponent');
    prototype.createComponent = createComponent;
    const container = Object.create(prototype);
    const get = jasmine
      .createSpy('get')
      .and.returnValue(new Map([[RealComponent, MockComponent]]));
    Object.defineProperty(container, 'injector', {
      value: { get },
    });
    const query = new QueryList<any>();
    const normalResult = {};

    expect(query.reset([normalResult, [container]])).toBeUndefined();

    expect(query.toArray()).toEqual([normalResult, container]);
    expect(query.first).toBe(normalResult);
    expect(query.last).toBe(container);
    expect(query.length).toEqual(2);
    expect(query.dirty).toEqual(false);
    expect(createComponent).not.toHaveBeenCalled();
    expect(get).not.toHaveBeenCalled();

    const options = { index: 0 };
    container.createComponent(RealComponent, options);

    expect(get.calls.mostRecent().args[0]).toBe(NG_MOCKS);
    expect(createComponent).toHaveBeenCalledWith(
      MockComponent,
      options,
    );
    expect(createComponent.calls.mostRecent().object).toBe(container);
    expect(prototype.createComponent).toBe(container.createComponent);
  });

  it('patches every concrete implementation once without invoking an overridden query iterator', () => {
    class RealComponent {}
    class MockComponent {}
    class CustomQueryList extends QueryList<any> {
      public override forEach = jasmine.createSpy('forEach');
    }

    const firstPrototype = Object.create(ViewContainerRef.prototype);
    Object.defineProperty(firstPrototype, 'constructor', {
      value: { prototype: firstPrototype },
    });
    const firstCreateComponent = jasmine.createSpy(
      'firstCreateComponent',
    );
    firstPrototype.createComponent = firstCreateComponent;
    const firstContainer = Object.create(firstPrototype);
    const firstGet = jasmine
      .createSpy('firstGet')
      .and.returnValue(new Map([[RealComponent, MockComponent]]));
    Object.defineProperty(firstContainer, 'injector', {
      value: { get: firstGet },
    });

    // A subclass can provide a different implementation of createComponent.
    const secondPrototype = Object.create(firstPrototype);
    Object.defineProperty(secondPrototype, 'constructor', {
      value: { prototype: secondPrototype },
    });
    const secondCreateComponent = jasmine.createSpy(
      'secondCreateComponent',
    );
    secondPrototype.createComponent = secondCreateComponent;
    const secondContainer = Object.create(secondPrototype);
    const secondGet = jasmine
      .createSpy('secondGet')
      .and.returnValue(new Map([[RealComponent, MockComponent]]));
    Object.defineProperty(secondContainer, 'injector', {
      value: { get: secondGet },
    });
    const query = new CustomQueryList();

    query.reset([firstContainer, [secondContainer]]);

    const firstPatched = firstContainer.createComponent;
    const secondPatched = secondContainer.createComponent;
    expect(firstPatched).not.toBe(firstCreateComponent);
    expect(secondPatched).not.toBe(secondCreateComponent);

    query.reset([[secondContainer], firstContainer]);
    query.reset([firstContainer, secondContainer]);

    expect(query.forEach).not.toHaveBeenCalled();
    expect(query.toArray()).toEqual([
      firstContainer,
      secondContainer,
    ]);
    expect(firstContainer.createComponent).toBe(firstPatched);
    expect(secondContainer.createComponent).toBe(secondPatched);
    expect(firstPrototype.createComponent).toBe(firstPatched);
    expect(secondPrototype.createComponent).toBe(secondPatched);
    expect(firstGet).not.toHaveBeenCalled();
    expect(secondGet).not.toHaveBeenCalled();

    const firstOptions = { index: 0 };
    const secondOptions = { index: 1 };
    firstContainer.createComponent(RealComponent, firstOptions);
    secondContainer.createComponent(RealComponent, secondOptions);

    expect(firstGet).toHaveBeenCalledTimes(1);
    expect(secondGet).toHaveBeenCalledTimes(1);
    expect(firstCreateComponent).toHaveBeenCalledTimes(1);
    expect(firstCreateComponent).toHaveBeenCalledWith(
      MockComponent,
      firstOptions,
    );
    expect(firstCreateComponent.calls.mostRecent().object).toBe(
      firstContainer,
    );
    expect(secondCreateComponent).toHaveBeenCalledTimes(1);
    expect(secondCreateComponent).toHaveBeenCalledWith(
      MockComponent,
      secondOptions,
    );
    expect(secondCreateComponent.calls.mostRecent().object).toBe(
      secondContainer,
    );
  });

  it('preserves a container without createComponent and still patches a later implementation', () => {
    class RealComponent {}
    class MockComponent {}

    const abstractContainer = Object.create(
      ViewContainerRef.prototype,
    );
    Object.defineProperty(abstractContainer, 'createComponent', {
      value: undefined,
    });
    const prototype = Object.create(ViewContainerRef.prototype);
    Object.defineProperty(prototype, 'constructor', {
      value: { prototype },
    });
    const createComponent = jasmine.createSpy('createComponent');
    prototype.createComponent = createComponent;
    const container = Object.create(prototype);
    const get = jasmine
      .createSpy('get')
      .and.returnValue(new Map([[RealComponent, MockComponent]]));
    Object.defineProperty(container, 'injector', {
      value: { get },
    });
    const query = new QueryList<any>();

    query.reset([abstractContainer]);
    query.reset([abstractContainer, container]);

    expect(query.toArray()).toEqual([abstractContainer, container]);
    expect(abstractContainer.createComponent).toBeUndefined();
    expect(get).not.toHaveBeenCalled();

    container.createComponent(RealComponent);

    expect(createComponent).toHaveBeenCalledTimes(1);
    expect(createComponent).toHaveBeenCalledWith(MockComponent);
    expect(createComponent.calls.mostRecent().object).toBe(container);
  });

  it('preserves ordinary query identity and notification behavior', () => {
    const query = new QueryList<{ id: number }>(true);
    const changes = jasmine.createSpy('changes');
    const identity = jasmine
      .createSpy('identity')
      .and.callFake((value: { id: number }) => value.id);
    const first = { id: 1 };
    const equal = { id: 1 };
    query.changes.subscribe(changes);

    query.reset([[first]], identity);

    expect(query.first).toBe(first);
    expect(changes).not.toHaveBeenCalled();
    query.notifyOnChanges();
    expect(changes).toHaveBeenCalledTimes(1);
    expect(changes).toHaveBeenCalledWith(query);

    query.reset([equal], identity);
    query.notifyOnChanges();

    expect(identity).toHaveBeenCalledWith(first);
    expect(identity).toHaveBeenCalledWith(equal);
    expect(changes).toHaveBeenCalledTimes(1);
    expect(query.first).toBe(first);

    query.reset([]);
    expect(query.length).toEqual(0);
    expect(query.first).toBeUndefined();
    expect(query.last).toBeUndefined();
    query.destroy();
  });

  it('preserves a later instance spy without copying it onto the shared prototype', () => {
    class RealComponent {}
    class MockComponent {}

    const originalResult = {};
    const spiedResult = {};
    const createComponent = jasmine
      .createSpy('createComponent')
      .and.returnValue(originalResult);
    const prototype = Object.create(ViewContainerRef.prototype);
    Object.defineProperty(prototype, 'constructor', {
      value: { prototype },
    });
    // Keep the implementation plain so Jasmine can spy on the installed wrapper.
    prototype.createComponent = function (
      this: ViewContainerRef,
      ...args: any[]
    ) {
      return createComponent.apply(this, args);
    };
    const container = Object.create(prototype);
    const get = jasmine
      .createSpy('get')
      .and.returnValue(new Map([[RealComponent, MockComponent]]));
    Object.defineProperty(container, 'injector', {
      value: { get },
    });
    const query = new QueryList<any>();
    query.reset([container]);
    const patched = container.createComponent;
    const instanceSpy = spyOn(
      container,
      'createComponent',
    ).and.returnValue(spiedResult);

    query.reset([[container]]);

    expect(container.createComponent).toBe(instanceSpy);
    expect(prototype.createComponent).toBe(patched);
    const options = { index: 0 };
    expect(container.createComponent(RealComponent, options)).toBe(
      spiedResult,
    );
    expect(instanceSpy).toHaveBeenCalledTimes(1);
    expect(instanceSpy).toHaveBeenCalledWith(RealComponent, options);
    expect(get).not.toHaveBeenCalled();
    expect(createComponent).not.toHaveBeenCalled();

    const sibling = Object.create(prototype);
    Object.defineProperty(sibling, 'injector', {
      value: { get },
    });

    expect(sibling.createComponent(RealComponent, options)).toBe(
      originalResult,
    );
    expect(sibling.createComponent).toBe(patched);
    expect(instanceSpy).toHaveBeenCalledTimes(1);
    expect(get).toHaveBeenCalledTimes(1);
    expect(createComponent).toHaveBeenCalledTimes(1);
    expect(createComponent).toHaveBeenCalledWith(
      MockComponent,
      options,
    );
    expect(createComponent.calls.mostRecent().object).toBe(sibling);
  });

  it('preserves an inherited patched method without adding another wrapper', () => {
    class RealComponent {}
    class MockComponent {}

    const prototype = Object.create(ViewContainerRef.prototype);
    Object.defineProperty(prototype, 'constructor', {
      value: { prototype },
    });
    const createComponent = jasmine.createSpy('createComponent');
    prototype.createComponent = createComponent;
    const container = Object.create(prototype);
    const query = new QueryList<any>();
    query.reset([container]);
    const patched = prototype.createComponent;

    const childPrototype = Object.create(prototype);
    Object.defineProperty(childPrototype, 'constructor', {
      value: { prototype: childPrototype },
    });
    const child = Object.create(childPrototype);
    const get = jasmine
      .createSpy('get')
      .and.returnValue(new Map([[RealComponent, MockComponent]]));
    Object.defineProperty(child, 'injector', {
      value: { get },
    });

    query.reset([child]);
    query.reset([[child], container]);

    expect(child.createComponent).toBe(patched);
    expect(childPrototype.createComponent).toBe(patched);
    expect(prototype.createComponent).toBe(patched);
    expect(get).not.toHaveBeenCalled();
    const options = { index: 0 };
    child.createComponent(RealComponent, options);

    expect(get).toHaveBeenCalledTimes(1);
    expect(createComponent).toHaveBeenCalledTimes(1);
    expect(createComponent).toHaveBeenCalledWith(
      MockComponent,
      options,
    );
    expect(createComponent.calls.mostRecent().object).toBe(child);
  });
});
