import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: 'ng-mocks:{{ title }}',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  public readonly title: string = 'hello';
}
