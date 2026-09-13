import { Component, NgModule } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  selector: 'target-ng-mocks-change-value-recipes',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: `
    <input id="plain" value="initial" />
    <select multiple [formControl]="choices">
      <option value="first">First</option>
      <option value="second">Second</option>
      <option value="third">Third</option>
    </select>
    <input type="radio" value="first" [formControl]="choice" />
    <input type="radio" value="second" [formControl]="choice" />
  `,
})
class TargetComponent {
  public readonly choices = new FormControl(['first']);
  public readonly choice = new FormControl('first');
}

@NgModule({
  declarations: [TargetComponent],
  imports: [ReactiveFormsModule],
})
class TargetModule {}

describe('ng-mocks-change:value-recipes', () => {
  beforeEach(() =>
    MockBuilder(TargetComponent, TargetModule).keep(
      ReactiveFormsModule,
    ),
  );

  it('changes a plain native input without an Angular listener', () => {
    MockRender(TargetComponent);
    const input = ngMocks.find('#plain');

    expect(input.nativeElement.value).toBe('initial');

    ngMocks.change(input, 'updated');

    expect(input.nativeElement.value).toBe('updated');
  });

  it('selects multiple options from an array of values', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const select = ngMocks.reveal(['formControl', component.choices]);

    expect(component.choices.value).toEqual(['first']);

    ngMocks.change(select, ['second', 'third']);
    fixture.detectChanges();

    expect(component.choices.value).toEqual(['second', 'third']);
    expect(select.nativeNode.options[0].selected).toBe(false);
    expect(select.nativeNode.options[1].selected).toBe(true);
    expect(select.nativeNode.options[2].selected).toBe(true);
  });

  it('checks the chosen classic radio and preserves both option values', () => {
    const fixture = MockRender(TargetComponent);
    const component = fixture.point.componentInstance;
    const first = ngMocks.find('input[type="radio"][value="first"]');
    const second = ngMocks.find(
      'input[type="radio"][value="second"]',
    );

    expect(component.choice.value).toBe('first');
    expect(first.nativeElement.checked).toBe(true);
    expect(second.nativeElement.checked).toBe(false);

    ngMocks.change(second, true);
    fixture.detectChanges();

    expect(component.choice.value).toBe('second');
    expect(first.nativeElement.checked).toBe(false);
    expect(second.nativeElement.checked).toBe(true);
    expect(first.nativeElement.value).toBe('first');
    expect(second.nativeElement.value).toBe('second');
  });
});
