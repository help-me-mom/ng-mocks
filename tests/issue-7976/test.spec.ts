import {
  Component,
  input,
  isSignal,
  NgModule,
  reflectComponentType,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

interface User {
  name: string;
}

@Component({
  selector: 'target-7976-user-profile-card',
  standalone: false,
  template: '{{ user().name }}',
})
class UserProfileCardComponent {
  public readonly user = input.required<User>();
}

@Component({
  selector: 'target-7976',
  standalone: false,
  template: ` <target-7976-user-profile-card [user]="user" /> `,
})
class TargetComponent {
  public readonly user: User = {
    name: 'test',
  };
}

@NgModule({
  declarations: [TargetComponent, UserProfileCardComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/7976
describe('issue-7976', () => {
  if (
    !reflectComponentType(UserProfileCardComponent)?.inputs.some(
      inputMetadata => inputMetadata.propName === 'user',
    )
  ) {
    it('needs compiled signal input metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('binds required signal inputs on mocked components', () => {
    const fixture = MockRender(TargetComponent);
    const mocked = ngMocks.find(
      UserProfileCardComponent,
    ).componentInstance;

    expect(isSignal(mocked.user)).toBe(true);
    expect(mocked.user()).toBe(fixture.point.componentInstance.user);
  });
});
