import { CommonModule } from '@angular/common';
import {
  Component,
  ContentChildren,
  Directive,
  QueryList,
  TemplateRef,
} from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Directive({
  selector: '[target]',
})
class TargetDirective {}

@Component({
  selector: 'target-mock-component-render-reduced',
  template: 'target',
})
class TargetComponent {
  @ContentChildren(TargetDirective, {
    read: TemplateRef,
  } as any)
  public readonly templates?: QueryList<TemplateRef<TargetDirective>>;
}

describe('mock-component-render:reduced', () => {
  beforeEach(() =>
    MockBuilder()
      .keep(CommonModule)
      .mock(TargetComponent)
      .mock(TargetDirective),
  );

  it('does not fail on fake hides', () => {
    const params = {
      reduce: false,
    };
    const fixture = MockRender(
      `
      <target-mock-component-render-reduced>
        <ng-template target>1</ng-template>
        <ng-template target>2</ng-template>
        <ng-container *ngIf="!reduce">
          <ng-template target>3</ng-template>
          <ng-template target>4</ng-template>
        </ng-container>
      </target-mock-component-render-reduced>`,
      params,
    );

    expect(fixture.nativeElement.innerHTML).not.toContain('1');
    expect(fixture.nativeElement.innerHTML).not.toContain('2');
    expect(fixture.nativeElement.innerHTML).not.toContain('3');
    expect(fixture.nativeElement.innerHTML).not.toContain('4');

    const component = ngMocks.findInstance(TargetComponent);
    if (isMockOf(component, TargetComponent, 'c')) {
      component.__render(['templates']);
    }
    expect(fixture.nativeElement.innerHTML).toContain('1');
    expect(fixture.nativeElement.innerHTML).toContain('2');
    expect(fixture.nativeElement.innerHTML).toContain('3');
    expect(fixture.nativeElement.innerHTML).toContain('4');

    params.reduce = true;
    fixture.detectChanges();
    // it also requires to trigger rerender in the mock component.
    if (isMockOf(component, TargetComponent, 'c')) {
      component.__render(['templates']);
    }
    expect(fixture.nativeElement.innerHTML).toContain('1');
    expect(fixture.nativeElement.innerHTML).toContain('2');
    expect(fixture.nativeElement.innerHTML).not.toContain('3');
    expect(fixture.nativeElement.innerHTML).not.toContain('4');
  });
});
