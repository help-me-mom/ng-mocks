import { Component, VERSION } from '@angular/core';
import * as ngCore from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockComponent, ngMocks } from 'ng-mocks';

// @see https://github.com/help-me-mom/ng-mocks/issues/10942
describe('issue-10942', () => {
  if (
    Number.parseInt(VERSION.major, 10) < 17 ||
    typeof (ngCore as any).model !== 'function'
  ) {
    it('needs signal model support', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  const model = (ngCore as any).model as (value: string) => any;
  const signal = (ngCore as any).signal as (value: string) => any;

  @Component({
    selector: 'target-10942-signal',
    template: '',
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  })
  class SignalComponent {
    public value = model('');
  }

  @Component({
    imports: [SignalComponent],
    selector: 'target-10942',
    template: `
      <h1>{{ title() }}</h1>
      <target-10942-signal [(value)]="title"></target-10942-signal>
    `,
    ['standalone' as never /* TODO: remove after upgrade to a14 */]: true,
  } as never)
  class TargetComponent {
    public title = signal('test-default');
  }

  const hasCompiledModelMetadata = () => {
    const mirror = (ngCore as any).reflectComponentType?.(
      SignalComponent,
    );

    return (
      Object.keys((SignalComponent as any).ɵcmp?.inputs || {})
        .length > 0 ||
      Object.keys((SignalComponent as any).ɵcmp?.outputs || {})
        .length > 0 ||
      (mirror?.inputs?.length || 0) > 0 ||
      (mirror?.outputs?.length || 0) > 0
    );
  };

  if (!hasCompiledModelMetadata()) {
    it('needs compiled signal model metadata', () => {
      expect(true).toBeTruthy();
    });

    return;
  }

  beforeEach(() => MockBuilder(TargetComponent));

  it('creates a mock with signal model bindings', () => {
    const mockComponent = MockComponent(SignalComponent) as any;

    expect(mockComponent.ɵcmp?.inputs?.value).toBeDefined();
    expect(mockComponent.ɵcmp?.outputs?.valueChange).toBeDefined();
  });

  it('provides the signal model change emitter after change detection', () => {
    const fixture = TestBed.createComponent(TargetComponent);

    fixture.detectChanges();
    expect(() =>
      ngMocks
        .output('target-10942-signal', 'valueChange')
        .emit('test-new'),
    ).not.toThrow();
    fixture.detectChanges();

    expect(ngMocks.find('h1').nativeElement.innerHTML).toEqual(
      'test-new',
    );
  });
});
