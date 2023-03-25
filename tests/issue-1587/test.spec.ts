import { CommonModule, DatePipe } from '@angular/common';
import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
@Pipe({
  name: 'target',
})
class TargetPipe extends DatePipe implements PipeTransform {}

@NgModule({
  declarations: [TargetPipe],
  exports: [TargetPipe],
  imports: [CommonModule],
})
class TargetModule {}

@Component({
  selector: 'target-1587',
  template: "{{ '2022-01-17' | target }}",
})
class TargetComponent {}

// https://github.com/help-me-mom/ng-mocks/issues/1587
describe('issue-1587', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('should contain valid html without user', () => {
    const fixture = MockRender(TargetComponent);
    expect(ngMocks.formatHtml(fixture)).toEqual(
      '<target-1587></target-1587>',
    );
  });
});
