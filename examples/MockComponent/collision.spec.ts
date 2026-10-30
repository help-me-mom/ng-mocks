import {
  Component,
  Directive,
  ViewEncapsulation,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

@Directive({ standalone: true })
class TargetDirective {
  public readonly value = 'real directive';
}

// An empty helper can attach a directive to its own host element. Give the
// original helper distinct metadata before Angular or ng-mocks inspects it.
@Component({
  selector: 'div[ng-directive-test-component]',
  standalone: true,
  template: '',
  encapsulation: ViewEncapsulation.None,
  host: { 'data-directive-host': 'target-directive' },
  hostDirectives: [TargetDirective],
})
class DirectiveTestHost {}

const mockedDirectiveTestHost = MockComponent(DirectiveTestHost);

describe('MockComponent:collision', () => {
  ngMocks.throwOnConsole();

  it('uses the real helper to test the directive', async () => {
    await TestBed.configureTestingModule({
      imports: [DirectiveTestHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(DirectiveTestHost);
    fixture.detectChanges();

    expect(
      fixture.debugElement.injector.get(TargetDirective).value,
    ).toBe('real directive');
    expect(fixture.nativeElement.dataset.directiveHost).toBe(
      'target-directive',
    );
  });

  it('renders the mock created before the test hooks', async () => {
    await TestBed.configureTestingModule({
      imports: [mockedDirectiveTestHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(mockedDirectiveTestHost);
    fixture.detectChanges();

    expect(
      isMockOf(fixture.componentInstance, DirectiveTestHost),
    ).toBe(true);
    expect(ngMocks.formatText(fixture)).toBe('');
  });
});
