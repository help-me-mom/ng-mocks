import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: 'ng-mocks',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {}
