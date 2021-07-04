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
  template: `dependency`,
})
class DependencyComponent {
  @ContentChild('something', {} as any)
  public injectedSomething?: TemplateRef<{}>;

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
      (someOutput)="trigger($event)"
    ></app-child>
  `,
})
class TestedComponent {
  public value = '';
  public trigger = () => {};
}

describe('MockModule', () => {
  beforeEach(() => {
    return MockBuilder(TestedComponent).mock(DependencyModule);
  });

  it('renders TestedComponent with its dependencies', () => {
    const fixture = MockRender(TestedComponent);
    const component = fixture.point.componentInstance;

    expect(component).toBeTruthy();
  });
});
