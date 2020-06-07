import { APP_ID, APP_INITIALIZER, InjectionToken, NgModule } from '@angular/core';

import { TargetComponent } from './fixtures.components';

export const TARGET_TOKEN = new InjectionToken('TARGET_TOKEN');

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
  providers: [
    {
      provide: TARGET_TOKEN,
      useValue: 'TARGET_TOKEN',
    },
    {
      provide: APP_ID,
      useValue: 'random',
    },
    {
      multi: true,
      provide: APP_INITIALIZER,
      useValue: () => undefined,
    },
  ],
})
export class TargetModule {}
