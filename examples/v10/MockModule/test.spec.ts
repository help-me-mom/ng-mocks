import { CommonModule } from '@angular/common';
import { Component, ContentChild, EventEmitter, Input, NgModule, Output, TemplateRef } from '@angular/core';
import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'dependency-component-selector',
  template: `dependency`,
})
class DependencyComponent {
  @ContentChild('something', { static: false } as any)
  injectedSomething: TemplateRef<{}>;

  @Input()
  someInput = '';

  @Output()
  someOutput = new EventEmitter();
}

@Component({
  selector: 'tested',
  template: `
    <dependency-component-selector [someInput]="value" (someOutput)="trigger($event)"></dependency-component-selector>
  `,
})
class TestedComponent {
  value = '';
  trigger = () => {};
}

@NgModule({
  declarations: [DependencyComponent],
  entryComponents: [DependencyComponent],
  exports: [DependencyComponent],
  imports: [CommonModule],
})
class DependencyModule {}

describe('v10:MockModule', () => {
  beforeEach(() => MockBuilder(TestedComponent).mock(DependencyModule));

  it('renders nothing without any error', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    expect(component).toBeTruthy();
  });
});
