import {
  Component,
  model,
  NO_ERRORS_SCHEMA,
  signal,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, ngMocks } from 'ng-mocks';

@Component({
  selector: 'app-signal',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  template: ``,
})
export class SignalComponent {
  model = model('');
}
@Component({
  imports: [SignalComponent],
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    true,
  schemas: [NO_ERRORS_SCHEMA], // TODO: remove after upgrade to a16
  template: `
    <h1>{{ title() }}</h1>
    <app-signal [(model)]="title"></app-signal>
  `,
})
export class TargetComponent {
  title = signal('test-default');
}

describe('issue-10942', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('issue-10942', () => {
    const fixture = TestBed.createComponent(TargetComponent);
    fixture.detectChanges();
    ngMocks.output('app-signal', 'modelChange').emit('test-new');
    fixture.detectChanges();
    expect(ngMocks.find('h1').nativeElement.innerHTML).toEqual(
      'test-new',
    );
  });
});
