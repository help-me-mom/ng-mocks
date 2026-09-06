import { CommonModule } from '@angular/common';
import {
  Component,
  Directive,
  Injectable,
  InjectionToken,
  Injector,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  MockBuilder,
  MockInstance,
  MockProvider,
  MockRender,
  MockService,
  ngMocks,
} from 'ng-mocks';

const NAME = new InjectionToken<{ value: string }>('live name');

@Injectable()
class TargetService {
  public value = '';

  public echo(): string {
    return 'real';
  }

  public other(): string {
    return 'real';
  }
}

@Component({
  selector: 'live-provider',
  ['standalone' as never]: false,
  template: '',
  providers: [
    MockProvider(TargetService, {
      echo: () => 'default',
      other: () => 'preserved',
    }),
    { provide: NAME, useFactory: () => ({ value: 'initial' }) },
  ],
})
class ProviderComponent {
  public constructor(public readonly service: TargetService) {}
}

@Component({
  selector: 'live-child',
  ['standalone' as never]: false,
  template: '',
})
class ChildComponent {
  public value = 'real';
}

@Directive({
  selector: '[liveChild]',
  ['standalone' as never]: false,
})
class ChildDirective {
  public value = 'real';
}

@Pipe({ name: 'liveChild', ['standalone' as never]: false })
class ChildPipe implements PipeTransform {
  public transform(): string {
    return 'real';
  }
}

@NgModule({
  imports: [CommonModule],
  declarations: [ChildComponent, ChildDirective, ChildPipe],
  exports: [ChildComponent, ChildDirective, ChildPipe],
})
class ChildModule {
  public value = 'real';
}

describe('mock-instance-member:existing', () => {
  MockInstance.scope();

  describe('providers', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        declarations: [ProviderComponent],
      }).compileComponents(),
    );

    it('customizes every existing and future instance with its own injector', () => {
      const first = TestBed.createComponent(ProviderComponent);
      const second = TestBed.createComponent(ProviderComponent);
      first.debugElement.injector.get(NAME).value = 'first';
      second.debugElement.injector.get(NAME).value = 'second';
      const customized: TargetService[] = [];

      MockInstance(TargetService, (instance, injector) => {
        customized.push(instance);
        instance.value = injector!.get(NAME).value;
        return { echo: () => instance.value };
      });

      expect(first.componentInstance.service).not.toBe(
        second.componentInstance.service,
      );
      expect(first.componentInstance.service.echo()).toEqual('first');
      expect(second.componentInstance.service.echo()).toEqual(
        'second',
      );
      expect(customized).toEqual([
        first.componentInstance.service,
        second.componentInstance.service,
      ]);

      MockInstance(TargetService, 'value', 'updated');
      expect(customized.length).toEqual(2);
      expect(first.componentInstance.service.echo()).toEqual(
        'updated',
      );
      expect(second.componentInstance.service.echo()).toEqual(
        'updated',
      );
      expect(first.componentInstance.service.other()).toEqual(
        'preserved',
      );

      const third = TestBed.createComponent(ProviderComponent);
      expect(third.componentInstance.service).not.toBe(
        first.componentInstance.service,
      );
      expect(third.componentInstance.service.echo()).toEqual(
        'updated',
      );
      expect(third.componentInstance.service.other()).toEqual(
        'preserved',
      );
      expect(customized.length).toEqual(3);
      expect(customized[2]).toBe(third.componentInstance.service);
    });

    it('preserves the opposite accessor and returns the supplied spies', () => {
      const service =
        TestBed.createComponent(ProviderComponent).componentInstance
          .service;
      const setter =
        typeof jest === 'undefined'
          ? jasmine.createSpy('setter')
          : jest.fn();
      expect(
        MockInstance(TargetService, 'value', setter, 'set'),
      ).toBe(setter);
      const getter =
        typeof jest === 'undefined'
          ? MockInstance(
              TargetService,
              'value',
              jasmine.createSpy('getter'),
              'get',
            ).and.returnValue('getter')
          : MockInstance(
              TargetService,
              'value',
              jest.fn(),
              'get',
            ).mockReturnValue('getter');

      service.value = 'setter';
      expect(setter).toHaveBeenCalledWith('setter');
      expect(service.value).toEqual('getter');

      const nextSetter =
        typeof jest === 'undefined'
          ? jasmine.createSpy('nextSetter')
          : jest.fn();
      MockInstance(TargetService, 'value', nextSetter, 'set');
      expect(service.value).toEqual('getter');
      service.value = 'next';
      expect(nextSetter).toHaveBeenCalledWith('next');
      expect(setter).toHaveBeenCalledTimes(1);
      expect(getter).toHaveBeenCalledTimes(2);
    });

    it('ignores undefined shape members but permits explicit undefined assignment', () => {
      const service =
        TestBed.createComponent(ProviderComponent).componentInstance
          .service;
      MockInstance(TargetService, () => ({
        echo: undefined,
        value: 'shape',
      }));
      expect(service.echo()).toEqual('default');
      expect(service.value).toEqual('shape');

      MockInstance(TargetService, 'echo', undefined as never);
      expect(service.echo).toBeUndefined();
      expect(service.other()).toEqual('preserved');
    });

    it('stops updating services when their fixture is destroyed', () => {
      const first = TestBed.createComponent(ProviderComponent);
      const second = TestBed.createComponent(ProviderComponent);
      const customized: TargetService[] = [];
      first.destroy();

      MockInstance(TargetService, instance => {
        customized.push(instance);
        instance.value = 'live';
      });

      expect(customized).toEqual([second.componentInstance.service]);
      expect(first.componentInstance.service.value).toBeUndefined();
      expect(second.componentInstance.service.value).toEqual('live');
    });

    it('does not instantiate a provider to apply a customization', () => {
      const customized: TargetService[] = [];
      MockInstance(TargetService, instance => {
        customized.push(instance);
      });
      expect(customized).toEqual([]);

      const service =
        TestBed.createComponent(ProviderComponent).componentInstance
          .service;
      expect(customized).toEqual([service]);
    });

    it('does not apply an operation twice to an instance created by its callback', () => {
      const first = TestBed.createComponent(ProviderComponent);
      const customized: TargetService[] = [];
      let created: TargetService | undefined;

      MockInstance(TargetService, instance => {
        customized.push(instance);
        if (instance === first.componentInstance.service) {
          created =
            TestBed.createComponent(ProviderComponent)
              .componentInstance.service;
        }
      });

      expect(created).toBeDefined();
      expect(customized).toEqual([
        first.componentInstance.service,
        created!,
      ]);
    });
  });

  it('customizes mocked declarations without changing their identity', async () => {
    await MockBuilder().mock(ChildModule);
    let module: ChildModule | undefined;
    MockInstance(ChildModule, instance => {
      module = instance;
    });
    const fixture = MockRender(
      '<live-child liveChild>{{ "" | liveChild }}</live-child>',
    );
    const component = ngMocks.findInstance(ChildComponent);
    const directive = ngMocks.findInstance(ChildDirective);
    const pipe = ngMocks.findInstance(ChildPipe);
    expect(module).toBeDefined();

    MockInstance(ChildComponent, 'value', 'component');
    MockInstance(ChildDirective, () => ({ value: 'directive' }));
    MockInstance(ChildPipe, 'transform', () => 'pipe');
    MockInstance(ChildModule, instance => {
      instance.value = 'module';
    });

    expect(ngMocks.findInstance(ChildComponent)).toBe(component);
    expect(ngMocks.findInstance(ChildDirective)).toBe(directive);
    expect(ngMocks.findInstance(ChildPipe)).toBe(pipe);
    expect(component.value).toEqual('component');
    expect(directive.value).toEqual('directive');
    expect(pipe.transform()).toEqual('pipe');
    expect(module!.value).toEqual('module');

    fixture.destroy();
    MockInstance(ChildComponent, 'value', 'destroyed');
    MockInstance(ChildDirective, 'value', 'destroyed');
    MockInstance(ChildPipe, 'transform', () => 'destroyed');
    expect(component.value).toEqual('component');
    expect(directive.value).toEqual('directive');
    expect(pipe.transform()).toEqual('pipe');
  });

  it('stops updating mocks removed with an embedded view', async () => {
    await MockBuilder()
      .keep(CommonModule)
      .mock(ChildComponent)
      .mock(ChildDirective);
    const fixture = MockRender(
      '<live-child *ngIf="visible" liveChild></live-child>',
      { visible: true },
    );
    const component = ngMocks.findInstance(ChildComponent);
    const directive = ngMocks.findInstance(ChildDirective);
    MockInstance(ChildComponent, 'value', 'before');
    MockInstance(ChildDirective, 'value', 'before');

    fixture.componentInstance.visible = false;
    fixture.detectChanges();
    MockInstance(ChildComponent, 'value', 'after');
    MockInstance(ChildDirective, 'value', 'after');

    expect(component.value).toEqual('before');
    expect(directive.value).toEqual('before');
  });

  it('preserves real services and direct MockService objects', async () => {
    await MockBuilder().keep(TargetService);
    const real = ngMocks.findInstance(TargetService);
    const direct = MockService(TargetService, {
      echo: () => 'direct',
    });

    MockInstance(TargetService, 'echo', () => 'updated');

    expect(real.echo()).toEqual('real');
    expect(direct.echo()).toEqual('direct');
  });

  it('leaves explicit useValue providers and resolved tokens unchanged', () => {
    const service = {
      value: 'explicit',
      echo: () => 'explicit',
      other: () => 'explicit',
    };
    TestBed.configureTestingModule({
      providers: [
        MockProvider(TargetService, service, 'useValue'),
        MockProvider(NAME, { value: 'token' }),
      ],
    });
    const injector = ngMocks.findInstance(Injector);
    const value = injector.get(NAME);
    // View Engine can clone useValue metadata. Preserve the actual injected object.
    const explicit = injector.get(TargetService);
    expect(explicit.echo()).toEqual('explicit');

    MockInstance(TargetService, 'echo', () => 'updated');
    MockInstance(NAME, () => ({ value: 'updated' }));

    expect(injector.get(TargetService)).toBe(explicit);
    expect(explicit.echo()).toEqual('explicit');
    expect(service.echo()).toEqual('explicit');
    expect(injector.get(NAME)).toBe(value);
    expect(value.value).toEqual('token');
  });
});
