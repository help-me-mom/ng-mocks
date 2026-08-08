import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AppService } from './app.service';

@Component({
  selector: 'app-root',
  standalone: false,
  template: 'ng-mocks:{{ scope }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  @Input() public readonly scope = 'default';

  public constructor(public readonly service: AppService) {}
}
