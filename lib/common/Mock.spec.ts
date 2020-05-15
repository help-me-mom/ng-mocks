/* tslint:disable: max-classes-per-file */

import { Component, Directive, NgModule, Pipe, PipeTransform } from '@angular/core';

import { MockComponent } from '../mock-component';
import { MockDirective } from '../mock-directive';
import { MockModule } from '../mock-module';
import { MockPipe } from '../mock-pipe';

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

  transform(): string {
    return typeof this.childValue;
  }
}

@Component({
  template: '',
})
class ChildComponentClass extends ParentClass implements PipeTransform {
  protected childValue = true;

  public childMethod(): boolean {
    return this.childValue;
  }

  transform(): string {
    return typeof this.childValue;
  }
}

@Directive({
  selector: 'mock',
})
class ChildDirectiveClass extends ParentClass implements PipeTransform {
  protected childValue = true;

  public childMethod(): boolean {
    return this.childValue;
  }

  transform(): string {
    return typeof this.childValue;
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

  transform(): string {
    return typeof this.childValue;
  }
}

describe('Mock', () => {
  it('should affect as MockModule', () => {
    const instance = new (MockModule(ChildModuleClass))();
    expect(instance).toEqual(jasmine.any(ChildModuleClass));
    expect((instance as any).__ngMocks).toEqual(true);
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockComponent', () => {
    const instance = new (MockComponent(ChildComponentClass))();
    expect(instance).toEqual(jasmine.any(ChildComponentClass));
    expect((instance as any).__ngMocks).toEqual(true);

    const spy = jasmine.createSpy('spy');
    instance.registerOnChange(spy);
    instance.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');

    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockDirective', () => {
    const instance = new (MockDirective(ChildDirectiveClass))();
    expect(instance).toEqual(jasmine.any(ChildDirectiveClass));
    expect((instance as any).__ngMocks).toEqual(true);

    const spy = jasmine.createSpy('spy');
    instance.registerOnChange(spy);
    instance.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');

    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockPipe', () => {
    const instance = new (MockPipe(ChildPipeClass))();
    expect(instance).toEqual(jasmine.any(ChildPipeClass));
    expect((instance as any).__ngMocks).toEqual(true);
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });
});

describe('Mock prototype', () => {
  @Component({
    selector: 'custom',
    template: '',
  })
  class CustomComponent {
    public test = 'custom';

    public get test1(): string {
      return 'test1';
    }

    public set test2(value: string) {
      this.test = value;
    }

    public testMethod(): string {
      return this.test;
    }
  }

  it('should get all things mocked and in the same time respect prototype', () => {
    const mockDef = MockComponent(CustomComponent);
    const mock = new mockDef();
    expect(mock).toEqual(jasmine.any(CustomComponent));

    // checking that it was processed through Mock
    expect((mock as any).__ngMocks).toBe(true);

    // checking that it was processed through MockControlValueAccessor
    const spy = jasmine.createSpy('spy');
    mock.registerOnChange(spy);
    mock.__simulateChange('test');
    expect(spy).toHaveBeenCalledWith('test');

    // properties are mocked too
    expect(mock.test1).toBeUndefined();
    (mock as any).test1 = 'MyCustomValue';
    expect(mock.test1).toEqual('MyCustomValue');

    // properties are mocked too
    expect(mock.test2).toBeUndefined();
    (mock as any).test2 = 'MyCustomValue';
    expect(mock.test2).toEqual('MyCustomValue');

    // properties are mocked too
    expect(mock.test).toBeUndefined();
    (mock as any).test = 'MyCustomValue';
    expect(mock.test).toEqual('MyCustomValue');
  });
});
