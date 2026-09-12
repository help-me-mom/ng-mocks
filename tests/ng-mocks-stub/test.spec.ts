import { Injectable, NgModule } from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

interface TargetService {
  readonly: boolean;
}

@Injectable()
class TargetService {
  public readonly name = 'target';
  public norm = 'normal';

  public constructor() {
    const desc = {
      configurable: false,
      value: false,
    };
    Object.freeze(desc);
    Object.defineProperty(this, 'readonly', desc);
  }

  public echo(): string {
    return this.name;
  }
}

@NgModule({
  providers: [TargetService],
})
class TargetModule {}

describe('ng-mocks-stub', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('respects configurable=false properties and does not fail', () => {
    const service = MockRender(TargetService).point.componentInstance;

    expect(service.readonly).toEqual(false);
    ngMocks.stub(service, { readonly: true });
    expect(service.readonly).toEqual(false);
  });

  it('switches configurable=false in overrides', () => {
    const service = MockRender(TargetService).point.componentInstance;
    const actual: Partial<TargetService> = {};

    expect(actual.readonly).toEqual(undefined);
    ngMocks.stub(actual, service);
    expect(actual.readonly).toEqual(false);
    actual.readonly = true;
    expect(actual.readonly).toEqual(true);
  });

  it('shadows inherited locked data without changing the original or siblings', () => {
    // Freeze the object so legacy Zone.js cannot rewrite the descriptor.
    const service = Object.freeze({ readonly: false });
    const descriptor = Object.getOwnPropertyDescriptor(
      service,
      'readonly',
    );
    const child = Object.create(service);
    const sibling = Object.create(service);

    expect(descriptor!.configurable).toBe(false);
    expect(ngMocks.stub(child, { readonly: true })).toBe(child);

    expect(child.readonly).toBe(true);
    expect(
      Object.getOwnPropertyDescriptor(child, 'readonly'),
    ).toEqual({
      configurable: true,
      enumerable: true,
      value: true,
      writable: true,
    });
    expect(service.readonly).toBe(false);
    expect(sibling.readonly).toBe(false);
    expect(
      Object.getOwnPropertyDescriptor(service, 'readonly'),
    ).toEqual(descriptor);
  });

  it('shadows inherited locked getters without reading the original getter', () => {
    let getterCalls = 0;
    const service = Object.freeze({
      get label() {
        getterCalls += 1;
        return 'original';
      },
    });
    const descriptor = Object.getOwnPropertyDescriptor(
      service,
      'label',
    );
    const child = Object.create(service);
    const overrides = {
      get label() {
        return 'stub';
      },
    };
    const replacement = Object.getOwnPropertyDescriptor(
      overrides,
      'label',
    )!.get;

    expect(descriptor!.configurable).toBe(false);
    expect(ngMocks.stub(child, overrides)).toBe(child);

    expect(getterCalls).toBe(0);
    expect(Object.getOwnPropertyDescriptor(child, 'label')!.get).toBe(
      replacement,
    );
    expect(child.label).toBe('stub');
    expect(getterCalls).toBe(0);
    expect(Object.getOwnPropertyDescriptor(service, 'label')).toEqual(
      descriptor,
    );
  });
});
