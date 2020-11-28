import {
  Component,
  Inject,
  Injectable as InjectableSource,
  InjectionToken,
  Injector,
  NgModule,
  Optional,
  SkipSelf,
} from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// Because of A5 we need to cast Injectable to any type.
// But because of A10+ we need to do it via a middle function.
function Injectable(...args: any[]): any {
  return InjectableSource(...args);
}

// Thanks A5.
export const TOKEN = new (InjectionToken as any)('TOKEN', {
  factory: () => 'token',
});

@Injectable()
export class ModuleService {
  public readonly name = 'module';
}

@Injectable({
  providedIn: 'root',
})
export class TargetService {
  public readonly name = 'service';
}

@Injectable({
  providedIn: 'root',
})
export class FakeService {
  public readonly name = 'fake';
}

@Injectable({
  providedIn: 'any',
})
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
  template: `{{ module.name }}`,
})
export class ModuleComponent {
  public constructor(public readonly module: ModuleService) {}
}

@NgModule({
  declarations: [TargetComponent, ModuleComponent],
  exports: [TargetComponent],
  imports: [BrowserModule, BrowserAnimationsModule],
  providers: [ProvidedService],
})
export class TargetModule {}
