import {
  Component,
  Injectable,
  Input,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { isMockOf, MockRender, ngMocks } from 'ng-mocks';

let calls: string[] = [];

@Injectable()
class FirstService {
  public constructor() {
    calls.push('first constructor');
  }

  public read(): string {
    calls.push('first method');

    return 'first';
  }
}

@Injectable()
class SecondService {
  public constructor() {
    calls.push('second constructor');
  }

  public read(): string {
    calls.push('second method');

    return 'second';
  }
}

@Injectable()
class ModuleService {
  public constructor() {
    calls.push('module service constructor');
  }

  public read(): string {
    calls.push('module service method');

    return 'module';
  }
}

@Component({
  selector: 'exported-15000',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real exported {{ value }}',
})
class ExportedComponent {
  @Input() public value = '';

  public constructor() {
    calls.push('exported constructor');
  }

  public read(): string {
    calls.push('exported method');

    return this.value;
  }
}

@Component({
  selector: 'private-15000',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
  template: 'real private {{ value }}',
})
class PrivateComponent {
  @Input() public value = '';

  public constructor() {
    calls.push('private constructor');
  }
}

@NgModule({
  declarations: [ExportedComponent, PrivateComponent],
  exports: [ExportedComponent],
  providers: [ModuleService],
})
class SharedModule {
  public constructor() {
    calls.push('module constructor');
  }
}

const first = {
  ngModule: SharedModule,
  providers: [FirstService],
};
const second = {
  ngModule: SharedModule,
  providers: [
    {
      provide: SecondService,
      useFactory: () => {
        calls.push('second factory');

        return new SecondService();
      },
    },
  ],
};

@NgModule({
  imports: [second],
})
class ParentModule {}

// @see https://github.com/help-me-mom/ng-mocks/issues/15000
describe('issue-15000:mocked', () => {
  beforeEach(() => {
    calls = [];
  });

  it('retains distinct mocked providers from repeated wrappers', async () => {
    await TestBed.configureTestingModule(
      ngMocks.guts(null, [first, second]),
    ).compileComponents();

    expect(calls).toEqual([]);
    const fixture = MockRender(
      '<exported-15000 [value]="value"></exported-15000>',
      { value: 'configured' },
    );
    const component = ngMocks.findInstance(
      fixture,
      ExportedComponent,
    );
    expect(isMockOf(component, ExportedComponent)).toBe(true);
    expect(component.value).toBe('configured');
    expect(component.read()).toBeUndefined();
    expect(ngMocks.formatText(fixture)).toBe('');

    const firstService = ngMocks.get(FirstService);
    const secondService = ngMocks.get(SecondService);
    expect(firstService instanceof FirstService).toBe(true);
    expect(secondService instanceof SecondService).toBe(true);
    expect(firstService.read()).toBeUndefined();
    expect(secondService.read()).toBeUndefined();
    expect(ngMocks.get(FirstService)).toBe(firstService);
    expect(ngMocks.get(SecondService)).toBe(secondService);
    expect(ngMocks.get(ModuleService).read()).toBeUndefined();
    expect(calls).toEqual([]);
  });

  it('retains wrapper providers after a destructured bare module', async () => {
    await TestBed.configureTestingModule(
      ngMocks.guts(null, [SharedModule, second]),
    ).compileComponents();

    expect(calls).toEqual([]);
    // Guts exposes even unexported declarations from its bare module.
    const fixture = MockRender(
      '<private-15000 [value]="value"></private-15000>',
      { value: 'private' },
    );
    const component = ngMocks.findInstance(fixture, PrivateComponent);
    expect(isMockOf(component, PrivateComponent)).toBe(true);
    expect(component.value).toBe('private');
    expect(ngMocks.formatText(fixture)).toBe('');

    const service = ngMocks.get(SecondService);
    expect(service instanceof SecondService).toBe(true);
    expect(service.read()).toBeUndefined();
    expect(ngMocks.get(SecondService)).toBe(service);
    expect(ngMocks.get(ModuleService).read()).toBeUndefined();
    expect(calls).toEqual([]);
  });

  it('keeps a wrapper before its bare module without duplicate declarations', async () => {
    await TestBed.configureTestingModule(
      ngMocks.guts(null, [second, SharedModule]),
    ).compileComponents();

    expect(calls).toEqual([]);
    const fixture = MockRender(
      '<exported-15000 [value]="value"></exported-15000>',
      { value: 'wrapper first' },
    );
    const component = ngMocks.findInstance(
      fixture,
      ExportedComponent,
    );
    expect(isMockOf(component, ExportedComponent)).toBe(true);
    expect(component.value).toBe('wrapper first');
    expect(component.read()).toBeUndefined();
    expect(ngMocks.formatText(fixture)).toBe('');

    const service = ngMocks.get(SecondService);
    expect(service instanceof SecondService).toBe(true);
    expect(service.read()).toBeUndefined();
    expect(ngMocks.get(SecondService)).toBe(service);
    expect(ngMocks.get(ModuleService).read()).toBeUndefined();
    expect(calls).toEqual([]);
  });

  it('retains a later destructured module import wrapper', async () => {
    await TestBed.configureTestingModule(
      ngMocks.guts(null, [SharedModule, ParentModule]),
    ).compileComponents();

    expect(calls).toEqual([]);
    const fixture = MockRender(
      '<private-15000 [value]="value"></private-15000>',
      { value: 'nested wrapper' },
    );
    const component = ngMocks.findInstance(fixture, PrivateComponent);
    expect(isMockOf(component, PrivateComponent)).toBe(true);
    expect(component.value).toBe('nested wrapper');
    expect(ngMocks.formatText(fixture)).toBe('');

    const service = ngMocks.get(SecondService);
    expect(service instanceof SecondService).toBe(true);
    expect(service.read()).toBeUndefined();
    expect(ngMocks.get(SecondService)).toBe(service);
    expect(ngMocks.get(ModuleService).read()).toBeUndefined();
    expect(calls).toEqual([]);
  });
});
