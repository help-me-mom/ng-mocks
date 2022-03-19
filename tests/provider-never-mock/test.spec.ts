import { APP_ID, InjectionToken, NgModule } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

const MY_APP_ID = new InjectionToken('MY_APP_ID');

@NgModule({
  providers: [
    {
      provide: APP_ID,
      useValue: 'target',
    },
    {
      provide: MY_APP_ID,
      useValue: 'target',
    },
  ],
})
class TargetModule {}

// Checking that never mock tokens (APP_ID) aren't mocked.
describe('provider-never-mock', () => {
  beforeEach(() => MockBuilder(null, TargetModule));

  it('does not mock APP_ID', () => {
    const fixture = MockRender('');

    // should stay as it is.
    const appId = fixture.debugElement.injector.get(APP_ID);
    expect(appId).not.toEqual('');

    // should be an empty string due to mocking.
    const myAppId = fixture.debugElement.injector.get(MY_APP_ID);
    expect(myAppId).toEqual('');
  });
});
