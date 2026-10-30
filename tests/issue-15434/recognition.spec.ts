import { Component, Injectable, Service } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';

import { isMockOf, isNgDef, MockService } from 'ng-mocks';

@Service()
class Store {
  public b(): number {
    return 2;
  }
}

@Service({ autoProvided: false })
class LocalStore {}

class InheritedStore extends Store {}

@Component({
  selector: 'inherited-15434',
  standalone: true,
  template: '',
})
class InheritedComponent extends Store {}

@Injectable({ providedIn: 'root' })
class InjectableStore {
  public b(): number {
    return 2;
  }
}

class PlainClass {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15434
describe('issue-15434:recognition', () => {
  it('recognizes Service as an injectable definition', () => {
    expect(isNgDef(Store, 'i')).toBe(true);
    expect(isNgDef(Store)).toBe(true);
  });

  it('recognizes a Service that opts out of automatic provision', () => {
    expect(isNgDef(LocalStore, 'i')).toBe(true);
  });

  it('recognizes inherited Service metadata', () => {
    expect(isNgDef(InheritedStore, 'i')).toBe(true);
  });

  it('preserves declaration classification for a Service subclass', () => {
    expect(isNgDef(InheritedComponent, 'c')).toBe(true);
    expect(isNgDef(InheritedComponent, 'i')).toBe(true);
    expect(isNgDef(InheritedComponent, 'd')).toBe(false);
    expect(isNgDef(InheritedComponent, 'p')).toBe(false);
  });

  it('recognizes Angular services migrated to Service', () => {
    expect(isNgDef(FormBuilder, 'i')).toBe(true);
    expect(isNgDef(Router, 'i')).toBe(true);
  });

  it('recognizes a mock whose methods were created successfully', () => {
    const instance = MockService(Store);

    expect(instance.b()).toBeUndefined();
    expect(isMockOf(instance, Store)).toBe(true);
    expect(isMockOf(instance, Store, 'i')).toBe(true);
    expect(isMockOf(new Store(), Store, 'i')).toBe(false);
  });

  it('preserves Injectable recognition and rejects undecorated classes', () => {
    expect(isNgDef(InjectableStore, 'i')).toBe(true);
    expect(
      isMockOf(MockService(InjectableStore), InjectableStore),
    ).toBe(true);
    expect(isNgDef(PlainClass, 'i')).toBe(false);
    expect(isNgDef(PlainClass)).toBe(false);
  });
});
