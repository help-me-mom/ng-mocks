import {
  Component,
  Directive,
  EventEmitter,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_ASYNC_VALIDATORS,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockModule } from '../mock-module/mock-module';
import { MockPipe } from '../mock-pipe/mock-pipe';

import { extendClass } from './core.helpers';
import decorateMock from './decorate.mock';
import { isMockOf } from './func.is-mock-of';
import { Mock } from './mock';
import {
  MockAsyncValidatorProxy,
  MockControlValueAccessorProxy,
  MockValidatorProxy,
} from './mock-control-value-accessor-proxy';

class ParentClass {
  protected parentValue = true;

  public parentMethod(): boolean {
    return this.parentValue;
  }
}

@NgModule({
  providers: [
    {
      provide: 'MOCK',
      useValue: 'HELLO',
    },
  ],
})
class ChildModule extends ParentClass implements PipeTransform {
  protected childValue = true;

  public childMethod(): boolean {
    return this.childValue;
  }

  public transform(): string {
    return typeof this.childValue;
  }
}

@Component({
  standalone: false,
  template: '',
})
class ChildComponent
  extends ParentClass
  implements PipeTransform, ControlValueAccessor
{
  protected childValue = true;

  public childMethod(): boolean {
    return this.childValue;
  }

  public registerOnChange = (fn: any) => fn;

  public registerOnTouched = (fn: any) => fn;

  public setDisabledState = (isDisabled: boolean) => isDisabled;

  public transform(): string {
    return typeof this.childValue;
  }

  public writeValue(obj: any) {
    return obj;
  }
}

@Directive({
  selector: 'mock',
  standalone: false,
})
class ChildDirective
  extends ParentClass
  implements PipeTransform, ControlValueAccessor
{
  protected childValue = true;

  public childMethod(): boolean {
    return this.childValue;
  }

  public registerOnChange = (fn: any) => fn;

  public registerOnTouched = (fn: any) => fn;

  public setDisabledState = (isDisabled: boolean) => isDisabled;

  public transform(): string {
    return typeof this.childValue;
  }

  public writeValue(obj: any) {
    return obj;
  }
}

@Pipe({
  name: 'mock',
  standalone: false,
})
class ChildPipe extends ParentClass implements PipeTransform {
  protected childValue = true;

  public childMethod(): boolean {
    return this.childValue;
  }

  public transform(): string {
    return typeof this.childValue;
  }
}

describe('Mock', () => {
  const changeDetectorRef = {
    detectChanges: () => undefined,
  };

  it('should affect as MockModule', () => {
    const instance = new (MockModule(ChildModule))();
    expect(instance).toEqual(jasmine.any(ChildModule));
    expect(isMockOf(instance, ChildModule, 'm')).toEqual(true);
    expect(instance.parentMethod()).toBeUndefined(
      'mock to an empty function',
    );
    expect(instance.childMethod()).toBeUndefined(
      'mock to an empty function',
    );
  });

  it('should affect as MockComponent', () => {
    const proxy = new MockControlValueAccessorProxy(ChildComponent);
    const instance = new (MockComponent(ChildComponent))();
    expect(instance).toEqual(jasmine.any(ChildComponent));
    expect(isMockOf(instance, ChildComponent, 'c')).toEqual(true);

    proxy.instance = instance;
    const spy = jasmine.createSpy('spy');
    proxy.registerOnChange(spy);
    instance.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');

    expect(instance.parentMethod()).toBeUndefined();
    expect(instance.childMethod()).toBeUndefined();
  });

  it('should affect as MockDirective', () => {
    const proxy = new MockControlValueAccessorProxy(ChildComponent);
    const instance = new (MockDirective(ChildDirective))();
    expect(instance).toEqual(jasmine.any(ChildDirective));
    expect(isMockOf(instance, ChildDirective, 'd')).toEqual(true);

    proxy.instance = instance;
    const spy = jasmine.createSpy('spy');
    proxy.registerOnChange(spy);
    instance.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');

    expect(instance.parentMethod()).toBeUndefined();
    expect(instance.childMethod()).toBeUndefined();
  });

  // Before the Angular 22 forms change, ng-mocks could rely on ngControl.valueAccessor already
  // containing the selected proxy by the time a mock component was instantiated. After the change,
  // Angular can keep the accessor candidates in rawValueAccessors first and select the final one
  // later. This regression test emulates that new lazy shape and verifies that ng-mocks now scans
  // rawValueAccessors, ignores proxies for other targets, and still wires the correct mock proxy.
  it('attaches a lazy value accessor from rawValueAccessors', () => {
    const mockDef = MockComponent(ChildComponent);
    const proxy = new MockControlValueAccessorProxy(mockDef);
    const skippedProxy = new MockControlValueAccessorProxy(ChildComponent);
    const ngControl = {
      _rawAsyncValidators: [],
      _rawValidators: [],
      rawValueAccessors: [skippedProxy, proxy],
      valueAccessor: proxy,
    };
    const instance = new mockDef(null as never, ngControl as never, changeDetectorRef as never);

    expect(proxy.instance).toBe(instance);
    expect(skippedProxy.instance).toBeUndefined();

    const spy = jasmine.createSpy('spy');
    proxy.registerOnChange(spy);
    instance.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');
  });

  // Some Angular forms paths now recover the accessor from DI instead of exposing it eagerly on the
  // control instance. Prior to the fix, ng-mocks only looked at ngControl.valueAccessor, so these
  // proxies stayed unattached and registerOnTouched / registerOnChange never reached the mock.
  // The expectation here documents the new compatibility path through NG_VALUE_ACCESSOR.
  it('attaches a lazy value accessor from NG_VALUE_ACCESSOR', () => {
    const mockDef = MockComponent(ChildComponent);
    const proxy = new MockControlValueAccessorProxy(mockDef);
    const injector = {
      get: (token: any, fallback: any) =>
        token === NG_VALUE_ACCESSOR ? [proxy] : fallback,
    };
    const ngControl = {
      _rawAsyncValidators: [],
      _rawValidators: [],
      rawValueAccessors: [],
      valueAccessor: null,
    };
    const instance = new mockDef(injector as never, ngControl as never, changeDetectorRef as never);

    expect(proxy.instance).toBe(instance);

    const spy = jasmine.createSpy('spy');
    proxy.registerOnTouched(spy);
    instance.__simulateTouch();
    expect(spy).toHaveBeenCalled();
  });

  // Validators broke for the same reason as CVAs: Angular can defer resolution and keep validator
  // proxies in DI rather than exposing them eagerly on the control. This verifies that ng-mocks
  // now attaches the generated mock instance to validator proxies discovered through NG_VALIDATORS.
  it('attaches a lazy validator from NG_VALIDATORS', () => {
    const mockDef = MockComponent(ChildComponent);
    const proxy = new MockValidatorProxy(mockDef);
    const injector = {
      get: (token: any, fallback: any) =>
        token === NG_VALIDATORS ? [proxy] : fallback,
    };
    const ngControl = {
      _rawAsyncValidators: [],
      _rawValidators: [],
      rawValueAccessors: [],
      valueAccessor: null,
    };
    const instance = new mockDef(injector as never, ngControl as never, changeDetectorRef as never);

    expect(proxy.instance).toBe(instance);

    const spy = jasmine.createSpy('spy');
    proxy.registerOnValidatorChange(spy);
    instance.__simulateValidatorChange();
    expect(spy).toHaveBeenCalled();
  });

  // Async validators follow the same lazy-resolution path. The regression here matters because a22
  // failures showed that simply fixing sync validators was not enough; ng-mocks also has to keep
  // async validator hooks working and preserve the historical null result contract.
  it('attaches a lazy async validator from NG_ASYNC_VALIDATORS', async () => {
    const mockDef = MockComponent(ChildComponent);
    const proxy = new MockAsyncValidatorProxy(mockDef);
    const injector = {
      get: (token: any, fallback: any) =>
        token === NG_ASYNC_VALIDATORS ? [proxy] : fallback,
    };
    const ngControl = {
      _rawAsyncValidators: [],
      _rawValidators: [],
      rawValueAccessors: [],
      valueAccessor: null,
    };
    const instance = new mockDef(injector as never, ngControl as never, changeDetectorRef as never);

    expect(proxy.instance).toBe(instance);

    const spy = jasmine.createSpy('spy');
    proxy.registerOnValidatorChange(spy);
    instance.__simulateValidatorChange();
    expect(spy).toHaveBeenCalled();
    await expectAsync(proxy.validate({})).toBeResolvedTo(null);
  });

  // The new implementation inspects more optional Angular internals than before. That makes it
  // important to preserve the old "best effort" behavior: if a DI lookup fails, mock creation
  // should still succeed instead of throwing and breaking unrelated tests.
  it('ignores failing injector lookups for lazy form proxies', () => {
    const mockDef = MockComponent(ChildComponent);
    const injector = {
      get: () => {
        throw new Error('fail');
      },
    };
    const ngControl = {
      _rawAsyncValidators: [],
      _rawValidators: [],
      rawValueAccessors: [],
      valueAccessor: null,
    };

    expect(
      () => new mockDef(injector as never, ngControl as never, changeDetectorRef as never),
    ).not.toThrow();
  });

  it('should affect as MockPipe', () => {
    const instance = new (MockPipe(ChildPipe))();
    expect(instance).toEqual(jasmine.any(ChildPipe));
    expect(isMockOf(instance, ChildPipe, 'p')).toEqual(true);
    expect(instance.parentMethod()).toBeUndefined();
    expect(instance.childMethod()).toBeUndefined();
  });
});

describe('Mock prototype', () => {
  @Component({
    selector: 'custom',
    standalone: false,
    template: '',
  })
  class CustomComponent implements ControlValueAccessor {
    public test = 'custom';

    public get test1(): string {
      return 'test1';
    }

    public set test2(value: string) {
      this.test = value;
    }

    public registerOnChange = (fn: any) => fn;

    public registerOnTouched = (fn: any) => fn;

    public setDisabledState = (isDisabled: boolean) => isDisabled;

    public testMethod(): string {
      return this.test;
    }

    public writeValue = (obj: any): void => obj;
  }

  it('should get all mock things and in the same time respect prototype', () => {
    const proxy = new MockControlValueAccessorProxy(CustomComponent);
    const mockDef = MockComponent(CustomComponent);
    const mock = new mockDef();
    expect(mock).toEqual(jasmine.any(CustomComponent));
    proxy.instance = mock;

    // checking that it was processed through Mock
    expect((mock as any).__ngMocksConfig).toBeDefined();
    expect((mock as any).__simulateChange).toBeDefined();

    // checking that it was processed through MockControlValueAccessor
    const spy = jasmine.createSpy('spy');
    proxy.registerOnChange(spy);
    mock.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');

    // properties are replaced with their mock objects too
    expect(mock.test1).toBeUndefined();
    (mock as any).test1 = 'MyCustomValue';
    expect(mock.test1).toEqual('MyCustomValue');

    // properties are replaced with their mock objects too
    expect(mock.test2).toBeUndefined();
    (mock as any).test2 = 'MyCustomValue';
    expect(mock.test2).toEqual('MyCustomValue');

    // properties are replaced with their mock objects too
    expect(mock.test).toBeUndefined();
    (mock as any).test = 'MyCustomValue';
    expect(mock.test).toEqual('MyCustomValue');
  });
});

describe('definitions', () => {
  it('skips output properties from config', () => {
    class TargetComponent {}

    const testComponent = extendClass(Mock);
    decorateMock(testComponent, TargetComponent, {
      outputs: ['__ngMocksConfig', 'test'],
    });

    const instance: any = new testComponent();
    expect(instance.__ngMocksConfig).not.toEqual(
      jasmine.any(EventEmitter),
    );
    expect(instance.test).toEqual(jasmine.any(EventEmitter));
  });

  it('adds missed properties to the instance', () => {
    class TargetComponent {}

    class TestMock extends Mock {
      public get test(): boolean {
        return false;
      }
    }

    const testComponent = extendClass(TestMock);
    decorateMock(testComponent, TargetComponent);
    const instance: any = new testComponent();
    expect(
      Object.getOwnPropertyDescriptor(instance, 'test'),
    ).toBeDefined();
  });

  it('skips existing properties from mockOf', () => {
    class TargetComponent {
      public get test(): boolean {
        return true;
      }
    }

    class TestMock extends Mock {
      public get test(): boolean {
        return false;
      }
    }

    const testComponent = extendClass(TestMock);
    decorateMock(testComponent, TargetComponent);
    const instance: any = new testComponent();
    expect(instance.test).toEqual(false);
  });

  it('allows empty instance of MockControlValueAccessorProxy', () => {
    const proxy = new MockControlValueAccessorProxy();
    expect(() => proxy.registerOnChange(undefined)).not.toThrow();
    expect(() => proxy.registerOnTouched(undefined)).not.toThrow();
    expect(() => proxy.setDisabledState(true)).not.toThrow();
    expect(() => proxy.setDisabledState(false)).not.toThrow();
    expect(() => proxy.writeValue(undefined)).not.toThrow();
  });

  it('allows empty instance of MockValidatorProxy', () => {
    const proxy = new MockValidatorProxy();
    expect(() =>
      proxy.registerOnValidatorChange(undefined),
    ).not.toThrow();
    expect(() => proxy.validate(undefined)).not.toThrow();
  });

  it('allows empty instance of MockAsyncValidatorProxy', () => {
    const proxy = new MockAsyncValidatorProxy();
    expect(() =>
      proxy.registerOnValidatorChange(undefined),
    ).not.toThrow();
    expect(() => proxy.validate(undefined)).not.toThrow();
  });
});
