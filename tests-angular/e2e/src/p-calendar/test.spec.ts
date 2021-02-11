import { Component, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';
import { PrimeTemplate } from 'primeng/api';
import { Calendar, CalendarModule } from 'primeng/calendar';

@Component({
  selector: 'target',
  template: `
    <p-calendar [(ngModel)]="dateValue">
      <ng-template pTemplate="header">Header</ng-template>
      <ng-template pTemplate="footer">Footer</ng-template>
    </p-calendar>
  `,
})
class TargetComponent {
  public dateValue = new Date();
}

@NgModule({
  declarations: [TargetComponent],
  imports: [CalendarModule, FormsModule],
})
class TargetModule {}

describe('p-calendar:directives', () => {
  ngMocks.faster();

  beforeEach(() => MockBuilder(TargetComponent, TargetModule));

  it('binds inputs', () => {
    // Rendering TargetComponent and accessing its instance.
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;

    // Looking for a debug element of `p-calendar`.
    const calendarEl = ngMocks.find('p-calendar');

    // Asserting bound properties.
    const actual = ngMocks.input(calendarEl, 'ngModel');
    expect(actual).toBe(targetComponent.dateValue);
  });

  it('binds outputs', () => {
    // Rendering TargetComponent and accessing its instance.
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;

    // Looking for a debug element of `p-calendar`.
    const calendarEl = ngMocks.find('p-calendar');

    // Simulating an emit.
    const expected = new Date();
    ngMocks.output(calendarEl, 'ngModelChange').emit(expected);

    // Asserting the effect of the emit.
    expect(targetComponent.dateValue).toEqual(expected);
  });

  it('provides correct template for pTemplate="header"', () => {
    // Rendering TargetComponent.
    MockRender(TargetComponent);

    // Looking for a debug element of `p-calendar`.
    const calendarEl = ngMocks.find('p-calendar');

    // Looking for the instance of PrimeTemplate.
    // 'header' is the first one.
    const [header] = ngMocks.findInstances(calendarEl, PrimeTemplate);

    // Asserting that it is the header.
    expect(header.name).toEqual('header');

    // Verifying that the directive has been mocked.
    // And rendering it.
    if (isMockOf(header, PrimeTemplate, 'd')) {
      header.__render();
    }

    // Asserting the rendered template.
    expect(calendarEl.nativeElement.innerHTML).toContain('Header');
  });

  it('provides correct template for pTemplate="footer"', () => {
    // Rendering TargetComponent.
    MockRender(TargetComponent);

    // Looking for a debug element of `p-calendar`.
    const calendarEl = ngMocks.find('p-calendar');

    // Looking for the instance of PrimeTemplate.
    // 'footer' is the second one.
    const [, footer] = ngMocks.findInstances(
      calendarEl,
      PrimeTemplate,
    );

    // Asserting that it is the footer.
    expect(footer.name).toEqual('footer');

    // Verifying that the directive has been mocked.
    // And rendering it.
    if (isMockOf(footer, PrimeTemplate, 'd')) {
      footer.__render();
    }

    // Asserting the rendered template.
    expect(calendarEl.nativeElement.innerHTML).toContain('Footer');
  });
});
