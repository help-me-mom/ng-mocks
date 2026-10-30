import { Component, Input } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockComponent, ngMocks } from 'ng-mocks';

@Component({
  selector: 'toolbar-15395',
  standalone: true,
  template: 'real toolbar: {{ title }}',
})
class ToolbarComponent {
  @Input() public title = '';
}

@Component({
  selector: 'main-15395',
  standalone: true,
  imports: [ToolbarComponent],
  template: '<toolbar-15395 [title]="title"></toolbar-15395>',
})
class MainComponent {
  public title = 'test';
}

// @see https://github.com/help-me-mom/ng-mocks/issues/15395
describe('issue-15395', () => {
  let consoleWarn: typeof console.warn;
  let consoleError: typeof console.error;
  let messages: string[];

  beforeEach(() => {
    messages = [];
    consoleWarn = console.warn;
    consoleError = console.error;
    ngMocks.stubMember(console, 'warn', (...args: unknown[]) => {
      messages.push(args.join(' '));
    });
    ngMocks.stubMember(console, 'error', (...args: unknown[]) => {
      messages.push(args.join(' '));
    });
  });

  afterEach(() => {
    ngMocks.stubMember(console, 'warn', consoleWarn);
    ngMocks.stubMember(console, 'error', consoleError);
  });

  it('renders the real dependency without component ID warnings', async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(MainComponent);
    fixture.detectChanges();
    const toolbar = ngMocks.find(fixture, ToolbarComponent);

    expect(
      isMockOf(toolbar.componentInstance, ToolbarComponent),
    ).toBe(false);
    expect(toolbar.componentInstance.title).toBe('test');
    expect(ngMocks.formatText(fixture)).toBe('real toolbar: test');
    expect(messages).toEqual([]);
  });

  it('accepts MockComponent in TestBed imports without component ID warnings', async () => {
    await TestBed.configureTestingModule({
      imports: [MainComponent, MockComponent(ToolbarComponent)],
    }).compileComponents();
    const fixture = TestBed.createComponent(MainComponent);
    fixture.detectChanges();
    const toolbar = ngMocks.find(fixture, ToolbarComponent);

    expect(
      isMockOf(toolbar.componentInstance, ToolbarComponent),
    ).toBe(true);
    expect(toolbar.componentInstance.title).toBe('test');
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(messages).toEqual([]);
  });

  it('replaces a standalone import without component ID warnings', async () => {
    // Exercise the explicit override with its own declarations.
    @Component({
      selector: 'override-toolbar-15395',
      standalone: true,
      template: 'real toolbar: {{ title }}',
    })
    class OverrideToolbarComponent {
      @Input() public title = '';
    }

    @Component({
      selector: 'override-main-15395',
      standalone: true,
      imports: [OverrideToolbarComponent],
      template:
        '<override-toolbar-15395 [title]="title"></override-toolbar-15395>',
    })
    class OverrideMainComponent {
      public title = 'test';
    }

    const mock = MockComponent(OverrideToolbarComponent);
    await TestBed.configureTestingModule({
      imports: [OverrideMainComponent, mock],
    })
      .overrideComponent(OverrideMainComponent, {
        remove: { imports: [OverrideToolbarComponent] },
        add: { imports: [mock] },
      })
      .compileComponents();
    expect(messages).toEqual([]);
    const fixture = TestBed.createComponent(OverrideMainComponent);
    fixture.detectChanges();
    const toolbar = ngMocks.find(fixture, OverrideToolbarComponent);

    expect(
      isMockOf(toolbar.componentInstance, OverrideToolbarComponent),
    ).toBe(true);
    expect(toolbar.componentInstance.title).toBe('test');
    expect(ngMocks.formatText(fixture)).toBe('');
    expect(messages).toEqual([]);
  });
});
