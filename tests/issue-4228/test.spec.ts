import { CommonModule } from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  Input,
  NgModule,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'app-target',
  template: `<custom-component></custom-component>name: {{ name }}`,
})
class TargetComponent {
  @Input() public readonly name: string = '';
}

@NgModule({
  imports: [CommonModule],
  declarations: [TargetComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/4228
describe('issue-4228', () => {
  ngMocks.throwOnConsole();

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('respects schemas in the mocked module', () => {
    const fixture = MockRender(TargetComponent);
    expect(fixture).toBeDefined();
  });
});
