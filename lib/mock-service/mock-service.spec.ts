// tslint:disable:max-classes-per-file

import { InjectionToken } from '@angular/core';

import { ngMocks } from '../mock-helper';

import { MockService } from './mock-service';

class DeepParentClass {
  public deepParentMethodName = 'deepParentMethod';

  public deepParentMethod() {
    return this.deepParentMethodName;
  }
}

class ParentClass extends DeepParentClass {
  public overrideMeName = 'overrideMe';
  public parentMethodName = 'parentMethod';

  public overrideMe() {
    return this.overrideMeName;
  }

  public parentMethod() {
    return this.parentMethodName;
  }
}

class ChildClass extends ParentClass {
  public childMethodName = 'childMethod';
  public overrideMeName = 'childOverrideMe';

  public childMethod() {
    return this.childMethodName;
  }

  public overrideMe() {
    return this.overrideMeName;
  }
}

class GetterSetterMethodHuetod {
  public nameValue = 'nameValue';

  get name(): string {
    return `${this.nameValue}${this.nameValue}`;
  }

  set name(value: string) {
    this.nameValue = value;
  }

  public nameMethod(value?: string): string {
    if (value) {
      this.name = value;
    }
    return this.name;
  }
}

describe('MockService', () => {
  it('should convert boolean, number, string, null and undefined to undefined', () => {
    expect(MockService(true)).toBeUndefined();
    expect(MockService(false)).toBeUndefined();
    expect(MockService(0)).toBeUndefined();
    expect(MockService(1)).toBeUndefined();
    expect(MockService(-1)).toBeUndefined();
    expect(MockService(NaN)).toBeUndefined();
    expect(MockService('')).toBeUndefined();
    expect(MockService(null)).toBeUndefined(); // tslint:disable-line:no-null-keyword
    expect(MockService(undefined)).toBeUndefined();
  });

  it('should convert an array of anything to an empty array', () => {
    expect(MockService([1, 0, 1])).toEqual([]);
    expect(MockService([new DeepParentClass()])).toEqual([]);
  });

  it('should convert arrow functions to () => undefined', () => {
    const mockedService = MockService(() => 0);
    expect(mockedService).toEqual(jasmine.any(Function), 'mockedService');
    expect(mockedService()).toBeUndefined();
    expect(mockedService.and.identity()).toBe('func:arrow-function');
  });

  it('should convert normal functions to an empty object because it is a class signature', () => {
    const mockedService = MockService(function test() {
      return 0;
    });
    expect(mockedService).toEqual(jasmine.any(Object), 'mockedService');
  });

  it('should mock own methods of a class without a parent', () => {
    const mockedService = MockService(DeepParentClass);
    expect(mockedService).toEqual(jasmine.any(Object));

    // all properties should be undefined, maybe defined as getters and setters.
    expect(mockedService.deepParentMethodName).toBeUndefined('deepParentMethodName');

    // all methods should be defined as functions which return undefined.
    expect(mockedService.deepParentMethod).toEqual(jasmine.any(Function), 'deepParentMethod');
    expect(mockedService.deepParentMethod()).toBeUndefined('deepParentMethod()');
    expect(ngMocks.stub<any>(mockedService, 'deepParentMethod').and.identity()).toBe(
      'DeepParentClass.deepParentMethod'
    );
  });

  it('should mock own and parent methods of a class', () => {
    const mockedService = MockService(ChildClass);
    expect(mockedService).toEqual(jasmine.any(ChildClass));

    // all properties should be undefined, maybe defined as getters and setters.
    expect(mockedService.deepParentMethodName).toBeUndefined('deepParentMethodName');
    expect(mockedService.parentMethodName).toBeUndefined('parentMethodName');
    expect(mockedService.overrideMeName).toBeUndefined('overrideMeName');
    expect(mockedService.childMethodName).toBeUndefined('childMethodName');

    // all methods should be defined as functions which return undefined.
    expect(mockedService.deepParentMethod).toEqual(jasmine.any(Function), 'deepParentMethod');
    expect(mockedService.deepParentMethod()).toBeUndefined('deepParentMethod()');
    expect(ngMocks.stub<any>(mockedService, 'deepParentMethod').and.identity()).toBe('ChildClass.deepParentMethod');
    expect(mockedService.parentMethod).toEqual(jasmine.any(Function), 'parentMethod');
    expect(mockedService.parentMethod()).toBeUndefined('parentMethod()');
    expect(ngMocks.stub<any>(mockedService, 'parentMethod').and.identity()).toBe('ChildClass.parentMethod');
    expect(mockedService.overrideMe).toEqual(jasmine.any(Function), 'overrideMe');
    expect(mockedService.overrideMe()).toBeUndefined('overrideMe()');
    expect(ngMocks.stub<any>(mockedService, 'overrideMe').and.identity()).toBe('ChildClass.overrideMe');
    expect(mockedService.childMethod).toEqual(jasmine.any(Function), 'childMethod');
    expect(mockedService.childMethod()).toBeUndefined('childMethod()');
    expect(ngMocks.stub<any>(mockedService, 'childMethod').and.identity()).toBe('ChildClass.childMethod');
  });

  it('should mock an instance of a class as an object', () => {
    const mockedService = MockService(new ChildClass());
    expect(mockedService).toEqual(jasmine.any(ChildClass));

    // all properties should be undefined, maybe defined as getters and setters.
    expect(mockedService.deepParentMethodName).toBeUndefined('deepParentMethodName');
    expect(mockedService.parentMethodName).toBeUndefined('parentMethodName');
    expect(mockedService.overrideMeName).toBeUndefined('overrideMeName');
    expect(mockedService.childMethodName).toBeUndefined('childMethodName');

    // all methods should be defined as functions which return undefined.
    expect(mockedService.deepParentMethod).toEqual(jasmine.any(Function), 'deepParentMethod');
    expect(mockedService.deepParentMethod()).toBeUndefined('deepParentMethod()');
    expect(mockedService.deepParentMethod.and.identity()).toBe('ChildClass.deepParentMethod');
    expect(mockedService.parentMethod).toEqual(jasmine.any(Function), 'parentMethod');
    expect(mockedService.parentMethod()).toBeUndefined('parentMethod()');
    expect(mockedService.parentMethod.and.identity()).toBe('ChildClass.parentMethod');
    expect(mockedService.overrideMe).toEqual(jasmine.any(Function), 'overrideMe');
    expect(mockedService.overrideMe()).toBeUndefined('overrideMe()');
    expect(mockedService.overrideMe.and.identity()).toBe('ChildClass.overrideMe');
    expect(mockedService.childMethod).toEqual(jasmine.any(Function), 'childMethod');
    expect(mockedService.childMethod()).toBeUndefined('childMethod()');
    expect(mockedService.childMethod.and.identity()).toBe('ChildClass.childMethod');
  });

  it('should mock own and nested properties of an object', () => {
    const mockedService = MockService({
      booleanFalse: false,
      booleanTrue: true,
      child1: {
        child11: {
          func1: () => 0,
          nullValue: null, // tslint:disable-line:no-null-keyword
          undefinedValue: undefined,
        },
        number0: 0,
        number1: 1,
      },
      child2: {
        stringEmpty: '',
      },
      func2: () => 1,
      func3: () => false,
    });

    expect(mockedService).toEqual({
      child1: {
        child11: {
          func1: jasmine.any(Function),
        },
      },
      child2: {},
      func2: jasmine.any(Function),
      func3: jasmine.any(Function),
    });

    expect(mockedService.child1.child11.func1()).toBeUndefined('func1()');
    expect(mockedService.child1.child11.func1.and.identity()).toBe('func:instance.child1.child11.func1');
    expect(mockedService.func2()).toBeUndefined('func2()');
    expect(mockedService.func2.and.identity()).toBe('func:instance.func2');
    expect(mockedService.func3()).toBeUndefined('func3()');
    expect(mockedService.func3.and.identity()).toBe('func:instance.func3');
  });

  it('mocks getters, setters and methods in a way that jasmine can mock them w/o an issue', () => {
    const mock: GetterSetterMethodHuetod = MockService(GetterSetterMethodHuetod);
    expect(mock).toBeDefined();

    // Creating a mock on the getter.
    spyOnProperty(mock, 'name', 'get').and.returnValue('mock');
    expect(mock.name).toEqual('mock');

    // Creating a mock on the setter.
    spyOnProperty(mock, 'name', 'set');
    mock.name = 'mock';
    expect(ngMocks.stub(mock, 'name', 'set')).toHaveBeenCalledWith('mock');

    // Creating a mock on the method.
    spyOn(mock, 'nameMethod').and.returnValue('mock');
    expect(mock.nameMethod('mock')).toEqual('mock');
    expect(ngMocks.stub(mock, 'nameMethod')).toHaveBeenCalledWith('mock');

    // Creating a mock on the method that doesn't exist.
    ngMocks.stub(mock, 'fakeMethod');
    spyOn(mock as any, 'fakeMethod').and.returnValue('mock');
    expect((mock as any).fakeMethod('mock')).toEqual('mock');
    expect(ngMocks.stub(mock, 'fakeMethod')).toHaveBeenCalledWith('mock');

    // Creating a mock on the property that doesn't exist.
    ngMocks.stub(mock, 'fakeProp', 'get');
    ngMocks.stub(mock, 'fakeProp', 'set');
    spyOnProperty(mock as any, 'fakeProp', 'get').and.returnValue('mockProp');
    spyOnProperty(mock as any, 'fakeProp', 'set');
    expect((mock as any).fakeProp).toEqual('mockProp');
    (mock as any).fakeProp = 'mockPropSet';
    expect(ngMocks.stub(mock as any, 'fakeProp', 'set')).toHaveBeenCalledWith('mockPropSet');
  });

  it('mocks injection tokens as undefined', () => {
    const token1 = MockService(new InjectionToken('hello'));
    expect(token1).toBeUndefined();
  });

  it('mocks a class to an instance with proper types', () => {
    class Test {
      public readonly nameRead = 'read';

      private name = 'test';

      public get nameGet(): string {
        return this.name;
      }

      public set nameSet(name: string) {
        this.name = name;
      }

      public echo(): string {
        return this.name;
      }
    }

    const test = ngMocks.stub(MockService(Test), {
      echo: jasmine.createSpy().and.returnValue('fake1'),
      fake: jasmine.createSpy().and.returnValue('fake2'),
      nameGet: 'fake3',
      nameRead: 'fake4',
      nameSet: 'fake5',
    });

    expect(test).toEqual(jasmine.any(Test));
    expect(test.echo()).toBe('fake1');
    expect((test as any).fake()).toBe('fake2');
    expect(test.nameGet).toBe('fake3');
    expect(test.nameRead).toBe('fake4');
    expect(test.nameSet).toBe('fake5');
  });
});
