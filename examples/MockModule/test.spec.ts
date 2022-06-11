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
  selector: 'app-child',
  template: 'dependency',
})
class DependencyComponent {
  @ContentChild('something', {} as any)
  public injectedSomething?: TemplateRef<any>;

  @Input()
  public someInput = '';

  @Output()
  public someOutput = new EventEmitter();
}

@NgModule({
  declarations: [DependencyComponent],
  exports: [DependencyComponent],
  imports: [CommonModule],
})
class DependencyModule {}

@Component({
  selector: 'tested',
  template: `
    <app-child
      [someInput]="value"
      (someOutput)="trigger()"
    ></app-child>
  `,
})
class MyComponent {
  public value = '';
  public trigger = () => undefined;
}

@NgModule({
  imports: [DependencyModule],
  declarations: [MyComponent],
})
class ItsModule {}

describe('MockModule', () => {
  beforeEach(() => {
    // DependencyModule is an import of ItsModule.
    return MockBuilder(MyComponent, ItsModule);
  });

  it('renders MyComponent with its dependencies', () => {
    const fixture = MockRender(MyComponent);
    const component = fixture.point.componentInstance;

    expect(component).toBeTruthy();
  });
});
