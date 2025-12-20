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
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
})
class TargetDirective {
  @Output() readonly triggerToggle = new EventEmitter<void>();

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
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
})
class MockTargetDirective {
  @Output() readonly triggerToggle = new EventEmitter<void>();

  @HostListener('click')
  hostListenerClick() {
    this.triggerToggle.emit();
  }
}

describe('MockBuilder:599', () => {
  it('throws on declaration', () => {
    try {
      MockBuilder().mock(TargetDirective, MockTargetDirective);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `MockBuilder.mock(${TargetDirective.name}) received a class when its shape is expected. Please try ngMocks.defaultMock instead.`,
      );
    }
  });

  it('throws on service', () => {
    try {
      MockBuilder().mock(AuthService, MockAuthService);
      fail('an error expected');
    } catch (error) {
      expect((error as Error).message).toContain(
        `MockBuilder.mock(${AuthService.name}) received a class when its shape is expected. Please try ngMocks.defaultMock instead.`,
      );
    }
  });
});
