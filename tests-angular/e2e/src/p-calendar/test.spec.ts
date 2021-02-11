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
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;
    const calendarEl = ngMocks.find(Calendar);

    const actual = ngMocks.input(calendarEl, 'ngModel');
    expect(actual).toBe(targetComponent.dateValue);
  });

  it('binds outputs', () => {
    const targetComponent = MockRender(TargetComponent).point
      .componentInstance;
    const calendarEl = ngMocks.find(Calendar);

    const expected = new Date();
    ngMocks.output(calendarEl, 'ngModelChange').emit(expected);
    expect(targetComponent.dateValue).toEqual(expected);
  });

  it('provides correct template for pTemplate="header"', () => {
    MockRender(TargetComponent);
    const calendarEl = ngMocks.find(Calendar);

    // nothing has been rendered
    expect(calendarEl.nativeElement.innerHTML).not.toContain(
      'Header',
    );
    expect(calendarEl.nativeElement.innerHTML).not.toContain(
      'Footer',
    );

    // checking header
    const [header] = ngMocks.findInstances(calendarEl, PrimeTemplate);
    if (isMockOf(header, PrimeTemplate, 'd')) {
      header.__render();
    }
    expect(calendarEl.nativeElement.innerHTML).toContain('Header');
    expect(calendarEl.nativeElement.innerHTML).not.toContain(
      'Footer',
    );
  });

  it('provides correct template for pTemplate="footer"', () => {
    MockRender(TargetComponent);
    const calendarEl = ngMocks.find(Calendar);

    // nothing has been rendered
    expect(calendarEl.nativeElement.innerHTML).not.toContain(
      'Header',
    );
    expect(calendarEl.nativeElement.innerHTML).not.toContain(
      'Footer',
    );

    // checking footer
    const [, footer] = ngMocks.findInstances(
      calendarEl,
      PrimeTemplate,
    );
    if (isMockOf(footer, PrimeTemplate, 'd')) {
      footer.__render();
    }
    expect(calendarEl.nativeElement.innerHTML).not.toContain(
      'Header',
    );
    expect(calendarEl.nativeElement.innerHTML).toContain('Footer');
  });
});
