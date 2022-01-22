import { CommonModule, DatePipe } from '@angular/common';
import { Component, Injectable, NgModule, Pipe } from '@angular/core';
import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Injectable()
@Pipe({
  name: 'target',
})
class TargetPipe extends DatePipe {}

@NgModule({
  declarations: [TargetPipe],
  exports: [TargetPipe],
  imports: [CommonModule],
})
class TargetModule {}

@Component({
  selector: 'target',
  template: `{{ '2022-01-17' | target }}`,
})
class TargetComponent {}

// https://github.com/ike18t/ng-mocks/issues/1587
describe('issue-1587', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('should contain valid html without user', () => {
    const fixture = MockRender(TargetComponent);
    expect(ngMocks.formatHtml(fixture)).toEqual('<target></target>');
  });
});
