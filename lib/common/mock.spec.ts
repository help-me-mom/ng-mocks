// tslint:disable max-file-line-count

import {
  Component,
  Directive,
  EventEmitter,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

import {
  MockAsyncValidatorProxy,
  MockControlValueAccessorProxy,
  MockValidatorProxy,
} from '../common/mock-control-value-accessor-proxy';
import { MockComponent } from '../mock-component/mock-component';
import { MockDirective } from '../mock-directive/mock-directive';
import { MockModule } from '../mock-module/mock-module';
import { MockPipe } from '../mock-pipe/mock-pipe';

import { Type } from './core.types';
import { isMockOf } from './func.is-mock-of';
import { Mock } from './mock';
import { MockOf } from './mock-of';

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
class ChildModuleClass extends ParentClass implements PipeTransform {
  protected childValue = true;

  public childMethod(): boolean {
    return this.childValue;
  }

  public transform(): string {
    return typeof this.childValue;
  }
}

@Component({
  template: '',
})
class ChildComponentClass
  extends ParentClass
  implements PipeTransform, ControlValueAccessor {
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
})
class ChildDirectiveClass
  extends ParentClass
  implements PipeTransform, ControlValueAccessor {
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
})
class ChildPipeClass extends ParentClass implements PipeTransform {
  protected childValue = true;

  public childMethod(): boolean {
    return this.childValue;
  }

  public transform(): string {
    return typeof this.childValue;
  }
}

describe('Mock', () => {
  it('should affect as MockModule', () => {
    const instance = new (MockModule(ChildModuleClass))();
    expect(instance).toEqual(jasmine.any(ChildModuleClass));
    expect(isMockOf(instance, ChildModuleClass, 'm')).toEqual(true);
    expect(instance.parentMethod()).toBeUndefined(
      'mock to an empty function',
    );
    expect(instance.childMethod()).toBeUndefined(
      'mock to an empty function',
    );
  });

  it('should affect as MockComponent', () => {
    const proxy = new MockControlValueAccessorProxy(
      ChildComponentClass,
    );
    const instance = new (MockComponent(ChildComponentClass))();
    expect(instance).toEqual(jasmine.any(ChildComponentClass));
    expect(isMockOf(instance, ChildComponentClass, 'c')).toEqual(
      true,
    );

    proxy.instance = instance;
    const spy = jasmine.createSpy('spy');
    proxy.registerOnChange(spy);
    instance.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');

    expect(instance.parentMethod()).toBeUndefined();
    expect(instance.childMethod()).toBeUndefined();
  });

  it('should affect as MockDirective', () => {
    const proxy = new MockControlValueAccessorProxy(
      ChildComponentClass,
    );
    const instance = new (MockDirective(ChildDirectiveClass))();
    expect(instance).toEqual(jasmine.any(ChildDirectiveClass));
    expect(isMockOf(instance, ChildDirectiveClass, 'd')).toEqual(
      true,
    );

    proxy.instance = instance;
    const spy = jasmine.createSpy('spy');
    proxy.registerOnChange(spy);
    instance.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');

    expect(instance.parentMethod()).toBeUndefined();
    expect(instance.childMethod()).toBeUndefined();
  });

  it('should affect as MockPipe', () => {
    const instance = new (MockPipe(ChildPipeClass))();
    expect(instance).toEqual(jasmine.any(ChildPipeClass));
    expect(isMockOf(instance, ChildPipeClass, 'p')).toEqual(true);
    expect(instance.parentMethod()).toBeUndefined();
    expect(instance.childMethod()).toBeUndefined();
  });
});

describe('Mock prototype', () => {
  @Component({
    selector: 'custom',
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

    @MockOf(TargetComponent, {
      outputs: ['__ngMocksConfig', 'test'],
    })
    class TestComponent extends Mock {}

    const instance: any = new TestComponent();
    expect(instance.__ngMocksConfig).not.toEqual(
      jasmine.any(EventEmitter),
    );
    expect(instance.test).toEqual(jasmine.any(EventEmitter));
  });

  it('adds missed properties to the instance', () => {
    const customProperty = (constructor: Type<any>) => {
      Object.defineProperty(constructor.prototype, 'test', {
        get: () => false,
      });
    };

    class TargetComponent {}

    @customProperty
    class TestMock extends Mock {}

    @MockOf(TargetComponent)
    class TestComponent extends TestMock {}

    const instance: any = new TestComponent();
    expect(
      Object.getOwnPropertyDescriptor(instance, 'test'),
    ).toBeDefined();
  });

  it('skips existing properties from mockOf', () => {
    const customPropertyFalse = (constructor: Type<any>) => {
      Object.defineProperty(constructor.prototype, 'test', {
        get: () => false,
      });
    };

    const customPropertyTrue = (constructor: Type<any>) => {
      Object.defineProperty(constructor.prototype, 'test', {
        get: () => true,
      });
    };

    @customPropertyTrue
    class TargetComponent {}

    @customPropertyFalse
    class TestMock extends Mock {}

    @MockOf(TargetComponent)
    class TestComponent extends TestMock {}

    const instance: any = new TestComponent();
    expect(instance.test).toEqual(false);
  });

  it('allows empty instance of MockControlValueAccessorProxy', () => {
    const proxy = new MockControlValueAccessorProxy();
    proxy.registerOnChange(undefined);
    proxy.registerOnTouched(undefined);
    proxy.setDisabledState(true);
    proxy.setDisabledState(false);
    proxy.writeValue(undefined);
  });

  it('allows empty instance of MockValidatorProxy', () => {
    const proxy = new MockValidatorProxy();
    proxy.registerOnValidatorChange(undefined);
    proxy.validate(undefined);
  });

  it('allows empty instance of MockAsyncValidatorProxy', () => {
    const proxy = new MockAsyncValidatorProxy();
    proxy.registerOnValidatorChange(undefined);
    proxy.validate(undefined);
  });
});
