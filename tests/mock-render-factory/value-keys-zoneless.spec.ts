import {
  ChangeDetectionStrategy,
  Component,
  Input,
  provideZonelessChangeDetection,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockRenderFactory, ngMocks } from 'ng-mocks';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'target-mock-render-factory-value-keys-zoneless',
  standalone: false,
  template: '{{ selected() }}|{{ unselected() }}|{{ callbackValue }}',
})
class TargetComponent {
  @Input() public selected!: () => string;
  @Input() public unselected!: () => string;
  @Input() public callbackValue?: string;
}

describe('mock-render-factory:value-keys-zoneless', () => {
  // Some included runners load Zone.js, so explicit zoneless setup emits NG0914.
  ngMocks.ignoreOnConsole('warn');

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TargetComponent],
      providers: [provideZonelessChangeDetection()],
    });
  });

  it('preserves callable values without extending the selected scheduling keys', async () => {
    let receiver: unknown;
    const selected = () => 'selected:initial';
    const unselected = () => 'unselected:initial';
    const params = {
      selected,
      unselected,
      callback() {
        receiver = this;

        return this.selected();
      },
    };
    const options = {
      configureTestBed: false,
      valueKeys: ['selected', 'unselected'],
    };
    const factory = MockRenderFactory(
      `
        <target-mock-render-factory-value-keys-zoneless
          [selected]="selected"
          [unselected]="unselected"
          [callbackValue]="callback()"
        ></target-mock-render-factory-value-keys-zoneless>
      `,
      ['selected'],
      options,
    );
    factory.configureTestBed();
    const fixture = factory(params);
    await fixture.whenStable();
    const callback = fixture.componentInstance.callback;

    expect(fixture.componentInstance.selected).toBe(selected);
    expect(fixture.componentInstance.unselected).toBe(unselected);
    expect(ngMocks.input(fixture.point, 'selected')).toBe(selected);
    expect(ngMocks.input(fixture.point, 'unselected')).toBe(
      unselected,
    );
    expect(callback).not.toBe(params.callback);
    expect(fixture.componentInstance.callback).toBe(callback);
    expect(receiver).toBe(params);
    expect(ngMocks.formatText(fixture)).toEqual(
      'selected:initial|unselected:initial|selected:initial',
    );

    params.selected = () => 'selected:params';
    await fixture.whenStable();

    expect(fixture.componentInstance.selected).toBe(params.selected);
    expect(ngMocks.input(fixture.point, 'selected')).toBe(
      params.selected,
    );
    expect(fixture.componentInstance.callback).toBe(callback);
    expect(receiver).toBe(params);
    expect(ngMocks.formatText(fixture)).toEqual(
      'selected:params|unselected:initial|selected:params',
    );

    const replacement = () => 'selected:wrapper';
    fixture.componentInstance.selected = replacement;
    await fixture.whenStable();

    expect(params.selected).toBe(replacement);
    expect(fixture.componentInstance.selected).toBe(replacement);
    expect(ngMocks.input(fixture.point, 'selected')).toBe(
      replacement,
    );
    expect(fixture.componentInstance.callback).toBe(callback);
    expect(receiver).toBe(params);
    expect(ngMocks.formatText(fixture)).toEqual(
      'selected:wrapper|unselected:initial|selected:wrapper',
    );

    params.unselected = () => 'unselected:params';
    await fixture.whenStable();

    expect(fixture.componentInstance.unselected).toBe(
      params.unselected,
    );
    expect(ngMocks.input(fixture.point, 'unselected')).toBe(
      unselected,
    );
    expect(ngMocks.formatText(fixture)).toEqual(
      'selected:wrapper|unselected:initial|selected:wrapper',
    );

    fixture.detectChanges();

    expect(ngMocks.input(fixture.point, 'unselected')).toBe(
      params.unselected,
    );
    expect(fixture.componentInstance.callback).toBe(callback);
    expect(receiver).toBe(params);
    expect(ngMocks.formatText(fixture)).toEqual(
      'selected:wrapper|unselected:params|selected:wrapper',
    );
  });
});
