import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChild,
  EventEmitter,
  Input,
  NgModule,
  Output,
  TemplateRef,
} from '@angular/core';

import { MockBuilder, MockRender } from 'ng-mocks';

@Component({
  selector: 'child-mock-module',
  template: 'dependency',
})
class ChildComponent {
  @ContentChild('something', {} as any)
  public injectedSomething?: TemplateRef<any>;

  @Input()
  public someInput = '';

  @Output()
  public someOutput = new EventEmitter();
}

@NgModule({
  declarations: [ChildComponent],
  exports: [ChildComponent],
  imports: [CommonModule],
})
class ChildModule {}

@Component({
  selector: 'target-mock-module',
  template: `
    <child-mock-module
      [someInput]="value"
      (someOutput)="trigger()"
    ></child-mock-module>
  `,
})
class TargetComponent {
  public value = '';
  public trigger = () => undefined;
}

@NgModule({
  imports: [ChildModule],
  declarations: [TargetComponent],
})
class ItsModule {}

describe('MockModule', () => {
  beforeEach(() => {
    // DependencyModule is an import of ItsModule.
    return MockBuilder(TargetComponent, ItsModule);
  });

  it('renders MyComponent with its dependencies', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;

    expect(component).toBeTruthy();
  });
});
