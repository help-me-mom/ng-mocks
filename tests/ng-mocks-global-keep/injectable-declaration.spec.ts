import {
  Component,
  Injectable,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

class ProviderValue implements PipeTransform {
  public readonly value = 'provider';

  public transform(value: string): string {
    return `${this.value}:${value}`;
  }
}

const providerValue = new ProviderValue();

@Injectable()
@Pipe({
  name: 'keptProviderPipe',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
})
class TargetPipe implements PipeTransform {
  public transform(value: string): string {
    return `${value}:pipe`;
  }
}

@Component({
  selector: 'target-global-keep-provider-pipe',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: '{{ "target" | keptProviderPipe }}',
})
class TargetComponent {}

@NgModule({
  declarations: [TargetComponent, TargetPipe],
  exports: [TargetComponent],
  providers: [{ provide: TargetPipe, useValue: providerValue }],
})
class TargetModule {}

describe('ng-mocks-global-keep:injectable declaration', () => {
  afterEach(() => ngMocks.globalWipe(TargetPipe));

  it('keeps the pipe declaration independently of its original provider recipe', async () => {
    ngMocks.globalKeep(TargetPipe);
    await MockBuilder(TargetComponent, TargetModule);

    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('target:pipe');
    expect(ngMocks.get(TargetPipe)).toBe(providerValue);
  });

  it('preserves an explicit keep of the same declaration and provider recipe', async () => {
    await MockBuilder(TargetComponent, TargetModule).keep(TargetPipe);

    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('target:pipe');
    expect(ngMocks.get(TargetPipe)).toBe(providerValue);
  });

  it('retains a concrete provider override while keeping the declaration', async () => {
    const override = new ProviderValue();
    let created = 0;
    const provider = {
      provide: TargetPipe,
      useFactory: () => {
        created += 1;

        return override;
      },
    };
    await TestBed.configureTestingModule({
      imports: [TargetModule],
      providers: [provider],
    }).compileComponents();

    expect(created).toEqual(0);
    const nativeFixture = TestBed.createComponent(TargetComponent);
    nativeFixture.detectChanges();
    // View Engine eagerly creates module providers on first TestBed use.
    const nativeCreated = created;
    expect(ngMocks.formatText(nativeFixture)).toEqual('target:pipe');
    expect(ngMocks.get(TargetPipe)).toBe(override);
    expect(created).toEqual(1);

    TestBed.resetTestingModule();
    created = 0;
    await MockBuilder(TargetComponent, TargetModule)
      .keep(TargetPipe)
      .provide(provider);

    expect(created).toEqual(0);
    const fixture = MockRender(TargetComponent);

    expect(ngMocks.formatText(fixture)).toEqual('target:pipe');
    expect(created).toEqual(nativeCreated);
    expect(ngMocks.get(TargetPipe)).toBe(override);
    expect(created).toEqual(1);
  });
});
