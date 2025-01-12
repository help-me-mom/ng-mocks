import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component(
  {
    selector: 'app-root',
    standalone: false,
    template: 'ng-mocks: {{ title }}',
    changeDetection: ChangeDetectionStrategy.OnPush,
  } as never /* TODO: remove after upgrade to a14 */,
)
export class AppComponent {
  public readonly title: string = 'hello';

  public appComponent() {}
}
