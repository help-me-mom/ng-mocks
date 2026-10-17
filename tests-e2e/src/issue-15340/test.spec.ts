import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from '@ngx-translate/core';
import { MockComponent, MockPipe, ngMocks } from 'ng-mocks';

@Component({
  selector: 'real',
  standalone: true,
  imports: [TranslatePipe],
  template: `{{ 'real' | translate }}`,
})
class RealComponent {}

@Component({
  selector: 'first',
  standalone: true,
  imports: [TranslatePipe],
  template: '',
})
class FirstComponent {}

@Component({
  selector: 'second',
  standalone: true,
  imports: [TranslatePipe],
  template: '',
})
class SecondComponent {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15340
describe('issue-15340:ngx-translate', () => {
  beforeAll(() => ngMocks.reset());
  afterAll(() => ngMocks.reset());

  it('reuses the cached TranslatePipe mock while another fixture is active', () => {
    MockComponent(FirstComponent);

    TestBed.configureTestingModule({
      imports: [
        RealComponent,
        MockPipe(TranslatePipe, value => `mock:${value}`),
      ],
    });
    const fixture = TestBed.createComponent(RealComponent);
    fixture.detectChanges();
    expect(ngMocks.formatText(fixture)).toEqual('mock:real');

    // TranslatePipe is also injectable: the active fixture maps it to a provider,
    // which must not replace the cached mock pipe in the component's imports.
    const mock = MockComponent(SecondComponent);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [mock],
    });
    expect(() =>
      TestBed.createComponent(mock).detectChanges(),
    ).not.toThrow();
  });
});
