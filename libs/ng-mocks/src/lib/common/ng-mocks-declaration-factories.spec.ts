import {
  rememberDeclarationFactory,
  resetDeclarationFactories,
} from './ng-mocks-declaration-factories';

describe('ng-mocks-declaration-factories', () => {
  afterEach(() => resetDeclarationFactories());

  it('restores the complete original factory descriptor', () => {
    const factory = jasmine.createSpy('factory');
    const declaration = {};
    const descriptor = {
      configurable: true,
      enumerable: true,
      value: factory,
      writable: false,
    };
    Object.defineProperty(declaration, 'ɵfac', descriptor);

    rememberDeclarationFactory(declaration);
    Object.defineProperty(declaration, 'ɵfac', {
      configurable: true,
      enumerable: false,
      value: jasmine.createSpy('override'),
      writable: true,
    });
    resetDeclarationFactories();

    expect(
      Object.getOwnPropertyDescriptor(declaration, 'ɵfac'),
    ).toEqual(descriptor);
    expect(factory).not.toHaveBeenCalled();
  });

  it('preserves lazy factory getters without invoking them', () => {
    const getter = jasmine.createSpy('get');
    const declaration = {};
    const descriptor = { configurable: true, get: getter };
    Object.defineProperty(declaration, 'ɵfac', descriptor);

    rememberDeclarationFactory(declaration);
    Object.defineProperty(declaration, 'ɵfac', {
      configurable: true,
      value: jasmine.createSpy('override'),
    });
    resetDeclarationFactories();

    expect(
      Object.getOwnPropertyDescriptor(declaration, 'ɵfac')?.get,
    ).toBe(getter);
    expect(getter).not.toHaveBeenCalled();
  });

  it('keeps the first snapshot across repeated overrides and forgets it after reset', () => {
    const original = jasmine.createSpy('original');
    const first = jasmine.createSpy('first');
    const second = jasmine.createSpy('second');
    const declaration = { ɵfac: original };

    rememberDeclarationFactory(declaration);
    declaration.ɵfac = first;
    rememberDeclarationFactory(declaration);
    declaration.ɵfac = second;
    resetDeclarationFactories();

    expect(declaration.ɵfac).toBe(original);

    declaration.ɵfac = first;
    rememberDeclarationFactory(declaration);
    declaration.ɵfac = second;
    resetDeclarationFactories();

    expect(declaration.ɵfac).toBe(first);
  });

  it('leaves declarations without an original own factory untouched', () => {
    const legacy = {};
    const declaration: any = {};
    const generated = jasmine.createSpy('generated');
    const updated = jasmine.createSpy('updated');

    rememberDeclarationFactory(legacy);
    rememberDeclarationFactory(declaration);
    declaration.ɵfac = generated;
    rememberDeclarationFactory(declaration);
    declaration.ɵfac = updated;
    resetDeclarationFactories();

    expect(
      Object.getOwnPropertyDescriptor(legacy, 'ɵfac'),
    ).toBeUndefined();
    expect(declaration.ɵfac).toBe(updated);
  });
});
