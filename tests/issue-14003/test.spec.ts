import {
  Component,
  input,
  NgModule,
  signal,
  WritableSignal,
} from '@angular/core';

import {
  DefaultRenderComponent,
  MockBuilder,
  MockRender,
  MockedComponentFixture,
} from 'ng-mocks';

@Component({
  selector: 'target-14003',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class TargetComponent {
  public label = input<string>();
  public nullable = input<string | null>(null);
  public required = input.required<number>();
  public enabled = input(false, {
    transform: (value: boolean | string) =>
      value === true || value === 'true',
  });
  public state = signal('initial');

  public marker(): string {
    return 'marker';
  }
}

@NgModule({
  declarations: [TargetComponent],
})
class TargetModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/14003
describe('issue-14003', () => {
  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('types signal inputs as binding values on MockRender componentInstance', () => {
    const fixture: MockedComponentFixture<TargetComponent> =
      MockRender(TargetComponent);

    const label: string | undefined = fixture.componentInstance.label;
    const nullable: string | null =
      fixture.componentInstance.nullable;
    const enabled: boolean | string =
      fixture.componentInstance.enabled;
    const required: number = fixture.componentInstance.required;
    const state: WritableSignal<string> =
      fixture.componentInstance.state;
    const marker: () => string = fixture.componentInstance.marker;

    expect(label).toBe(fixture.componentInstance.label);
    expect(nullable).toBe(fixture.componentInstance.nullable);
    expect(enabled).toBe(fixture.componentInstance.enabled);
    expect(required).toBe(fixture.componentInstance.required);
    expect(state()).toEqual('initial');

    fixture.componentInstance.label = undefined;
    fixture.componentInstance.label = 'updated';
    fixture.componentInstance.nullable = null;
    fixture.componentInstance.required = 42;
    fixture.componentInstance.enabled = true;
    fixture.componentInstance.enabled = 'true';

    expect(marker()).toEqual('marker');
  });

  it('types signal inputs as binding values on DefaultRenderComponent', () => {
    const fixture = MockRender(TargetComponent);
    const componentInstance: DefaultRenderComponent<TargetComponent> =
      fixture.componentInstance;

    const label: string | undefined = componentInstance.label;
    const nullable: string | null = componentInstance.nullable;
    const enabled: boolean | string = componentInstance.enabled;
    const required: number = componentInstance.required;
    const state: WritableSignal<string> = componentInstance.state;

    expect(label).toBe(componentInstance.label);
    expect(nullable).toBe(componentInstance.nullable);
    expect(enabled).toBe(componentInstance.enabled);
    expect(required).toBe(componentInstance.required);
    expect(state()).toEqual('initial');

    componentInstance.label = undefined;
    componentInstance.label = 'updated';
    componentInstance.nullable = null;
    componentInstance.required = 42;
    componentInstance.enabled = true;
    componentInstance.enabled = 'true';
  });
});
