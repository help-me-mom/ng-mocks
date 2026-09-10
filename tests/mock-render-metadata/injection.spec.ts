import {
  Attribute,
  Component,
  Host,
  Inject,
  InjectionToken,
  Optional,
  Self,
  SkipSelf,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRenderFactory, ngMocks } from 'ng-mocks';

const TOKEN = new InjectionToken<string>('metadata-token');
const MISSING = new InjectionToken<string>('metadata-missing');
const VIEW = new InjectionToken<string>('metadata-view');

@Component({
  providers: [{ provide: TOKEN, useValue: 'local' }],
  viewProviders: [{ provide: VIEW, useValue: 'view' }],
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ local }}:{{ parent }}:{{ view }}',
})
class TargetComponent {
  public constructor(
    @Self() @Inject(TOKEN) public readonly local: string,
    @SkipSelf() @Inject(TOKEN) public readonly parent: string,
    @Host() @Inject(VIEW) public readonly view: string,
    @Optional()
    @Self()
    @Inject(MISSING)
    public readonly missing: string | null,
    @Attribute('data-absent') public readonly absent: string,
  ) {}
}

describe('mock-render-metadata:injection', () => {
  beforeEach(() => MockBuilder(TargetComponent));

  it('retains constructor tokens, lookup flags, providers and view providers on selectorless clones', () => {
    const factory = MockRenderFactory(TargetComponent, []);
    factory.configureTestBed();
    // MockRender's providers option also supplies the rendered element. Set a
    // provider on the wrapper alone to distinguish Self from SkipSelf lookup.
    TestBed.overrideComponent(factory.declaration as never, {
      set: { providers: [{ provide: TOKEN, useValue: 'parent' }] },
    });
    const fixture = factory();
    const target = fixture.point.componentInstance;

    expect(target.local).toEqual('local');
    expect(target.parent).toEqual('parent');
    expect(target.view).toEqual('view');
    expect(target.missing).toBeNull();
    expect(target.absent).toBeNull();
    expect(ngMocks.formatText(fixture)).toEqual('local:parent:view');
    expect(ngMocks.findInstance(TargetComponent)).toBe(target);
  });
});
