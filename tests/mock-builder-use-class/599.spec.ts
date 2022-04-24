import {
  Directive,
  EventEmitter,
  HostListener,
  Injectable,
  Output,
} from '@angular/core';

import { MockBuilder } from 'ng-mocks';

/**
 * Let's pretend that the service needs complex db.
 * That's why login and logout throw errors.
 */
@Injectable()
class AuthService {
  isLoggedIn = false;

  login() {
    throw new Error('login needs db');
  }

  logout() {
    throw new Error('logout needs db');
  }
}

/**
 * Mock of the service simplifies calls of login and logout.
 * And we would like to use this mock in out tests.
 */
@Injectable()
class MockAuthService {
  isLoggedIn = false;

  login() {
    this.isLoggedIn = true;
  }

  logout() {
    this.isLoggedIn = false;
  }
}

/**
 * Let's pretend that the directive needs complex db.
 * That's why click throws an error.
 */
@Directive({
  selector: 'button',
})
class TargetDirective {
  @Output() readonly toggle = new EventEmitter<void>();

  @HostListener('click')
  hostListenerClick() {
    throw new Error('click needs db');
  }
}

/**
 * Mock of the directive simplifies calls of click.
 * And we would like to use this mock in out tests.
 */
@Directive({
  selector: 'button',
})
class MockTargetDirective {
  @Output() readonly toggle = new EventEmitter<void>();

  @HostListener('click')
  hostListenerClick() {
    this.toggle.emit();
  }
}

describe('MockBuilder:599', () => {
  it('throws on declaration', () => {
    expect(() =>
      MockBuilder().mock(TargetDirective, MockTargetDirective),
    ).toThrowError(
      'MockBuilder.mock(TargetDirective) received a class when its shape is expected. Please try ngMocks.defaultMock instead.',
    );
  });

  it('throws on service', () => {
    expect(() =>
      MockBuilder().mock(AuthService, MockAuthService),
    ).toThrowError(
      'MockBuilder.mock(AuthService) received a class when its shape is expected. Please try ngMocks.defaultMock instead.',
    );
  });
});
