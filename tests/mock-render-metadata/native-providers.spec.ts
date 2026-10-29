import {
  Component,
  Directive,
  HostBinding,
  Injectable,
  Input,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  isMockOf,
  MockComponent,
  MockRender,
  ngMocks,
} from 'ng-mocks';

@Injectable()
class Dependency {
  public static constructed = 0;
  public constructor() {
    Dependency.constructed += 1;
  }
}

const provider = { provide: Dependency, useClass: Dependency };

@Directive({
  selector: '[nativeProviderFirst], [nativeProviderSecond]',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  providers: [provider],
})
class TargetDirective {
  @HostBinding('attr.data-label')
  @Input()
  public label = '';
}

@Component({
  selector: 'native-provider-unrelated',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '',
})
class UnrelatedComponent {}

describe('mock-render-metadata:native directive providers', () => {
  beforeEach(() => {
    Dependency.constructed = 0;
    ngMocks.globalMock(Dependency);
  });
  afterEach(() => ngMocks.globalWipe(Dependency));

  it('replays a native directive provider removal without an automatic frame', async () => {
    await TestBed.configureTestingModule({
      declarations: [TargetDirective],
    })
      .overrideDirective(TargetDirective, {
        remove: { providers: [provider] },
      })
      .compileComponents();
    const fixture = MockRender(TargetDirective, { label: 'bound' });
    const target = fixture.point.componentInstance;

    expect(isMockOf(target, TargetDirective)).toBe(false);
    expect(fixture.point.injector.get(TargetDirective)).toBe(target);
    expect(fixture.point.injector.get(Dependency, null)).toBeNull();
    expect(fixture.point.attributes['data-label']).toBe('bound');
    expect(Dependency.constructed).toBe(0);
  });

  it('projects effective directive providers while preserving the middleware alias and binding', async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TargetDirective,
        MockComponent(UnrelatedComponent),
      ],
    })
      .overrideDirective(TargetDirective, {
        remove: { providers: [provider] },
      })
      .compileComponents();
    const fixture = MockRender(TargetDirective, { label: 'bound' });
    const target = fixture.point.componentInstance;

    expect(isMockOf(target, TargetDirective)).toBe(false);
    expect(fixture.point.injector.get(TargetDirective)).toBe(target);
    expect(fixture.point.injector.get(Dependency, null)).toBeNull();
    expect(fixture.point.attributes['data-label']).toBe('bound');
    expect(Dependency.constructed).toBe(0);
  });
});
