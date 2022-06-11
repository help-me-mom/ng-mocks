import { Component, Inject, Injectable, InjectionToken, Injector, NgModule, Optional, SkipSelf } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Thanks A5.
export const TOKEN = new (InjectionToken as any)('TOKEN', {
  factory: () => 'token',
});

@Injectable()
export class ModuleService {
  public readonly name = 'module';
}

// @TODO remove with A5 support
const injectableTargetServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

@Injectable(...injectableTargetServiceArgs)
export class TargetService {
  public readonly name = 'service';
}

// @TODO remove with A5 support
const injectableFakeServiceArgs = [
  {
    providedIn: 'root',
  } as never,
];

@Injectable(...injectableFakeServiceArgs)
export class FakeService {
  public readonly name = 'fake';
}

const injectableProvidedServiceArgs = [
  {
    providedIn: 'any',
  } as never,
];

@Injectable(...injectableProvidedServiceArgs)
export class ProvidedService {
  public readonly name = 'provided';
}

@Component({
  selector: 'target',
  template: `
    "service:{{ service.name }}" "fake:{{ fake.name }}" "injected:{{ injected.name }}" "provided:{{ provided.name }}"
    "token:{{ token }}"
  `,
})
export class TargetComponent {
  public readonly injected: TargetService;

  public constructor(
    @Inject(FakeService) public readonly fake: TargetService,
    @Optional()
    @Inject(TOKEN)
    @SkipSelf()
    public readonly token: string,
    @Optional() @SkipSelf() public readonly service: TargetService,
    @Inject(TOKEN)
    @Optional()
    @SkipSelf()
    public readonly token2: string,
    public readonly provided: ProvidedService,
    injector: Injector,
  ) {
    this.injected = injector.get(TargetService);
  }
}

@Component({
  selector: 'module',
  template: '{{ moduleService.name }}',
})
export class ModuleComponent {
  public constructor(public readonly moduleService: ModuleService) {}
}

@NgModule({
  declarations: [TargetComponent, ModuleComponent],
  exports: [TargetComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
  providers: [ProvidedService],
})
export class TargetModule {}
