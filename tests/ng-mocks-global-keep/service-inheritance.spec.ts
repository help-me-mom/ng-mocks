import {
  Component,
  inject,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
  Service,
} from '@angular/core';

import { isMockOf, MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Service()
class ParentService {}

@Service({ autoProvided: false })
class ProviderService {
  public name(): string {
    return 'provider';
  }
}

@Injectable()
class ViewService {
  public name(): string {
    return 'view';
  }
}

@Pipe({ name: 'target', standalone: true })
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return `${value}:pipe`;
  }
}

@Component({
  selector: 'target-global-keep-service-inheritance',
  standalone: true,
  imports: [TargetPipe],
  providers: [ProviderService],
  viewProviders: [ViewService],
  template: '{{ provider.name() | target }}:{{ view.name() }}',
})
class TargetComponent extends ParentService {
  public readonly provider = inject(ProviderService);
  public readonly view = inject(ViewService);
}

@NgModule({
  imports: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

// The inherited injectable category must not hide the component's own dependencies.
// @see https://github.com/help-me-mom/ng-mocks/issues/15478
describe('ng-mocks-global-keep:Service inheritance', () => {
  afterEach(() => {
    ngMocks.globalWipe(TargetComponent);
    ngMocks.globalWipe(ProviderService);
    ngMocks.globalWipe(ViewService);
    ngMocks.globalWipe(TargetPipe);
  });

  it('keeps imports, providers and view providers of a Service-derived component recursively', async () => {
    ngMocks.globalKeep(TargetComponent, true);
    await MockBuilder(null, TargetModule);

    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('provider:pipe:view');
    expect(
      isMockOf(
        fixture.point.componentInstance.provider,
        ProviderService,
        'i',
      ),
    ).toBe(false);
    expect(
      isMockOf(
        fixture.point.componentInstance.view,
        ViewService,
        'i',
      ),
    ).toBe(false);
  });
});
