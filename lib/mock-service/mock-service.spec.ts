// tslint:disable:max-classes-per-file

import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { InjectionToken, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, NG_INTERCEPTORS } from 'ng-mocks';

import { NG_GUARDS } from '../common';
import { ngMocksUniverse } from '../common/ng-mocks-universe';
import { ngMocks } from '../mock-helper';

import { MockService, mockServiceHelper } from './mock-service';

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
    // for jest
    // spyOnProperty(mock, 'name', 'get').mockReturnValue('mock');
    expect(mock.name).toEqual('mock');

    // Creating a mock on the setter.
    spyOnProperty(mock, 'name', 'set');
    mock.name = 'mock';
    expect(ngMocks.stub(mock, 'name', 'set')).toHaveBeenCalledWith('mock');

    // Creating a mock on the method.
    spyOn(mock, 'nameMethod').and.returnValue('mock');
    // for jest
    // spyOn(mock, 'nameMethod').mockReturnValue('mock');
    expect(mock.nameMethod('mock')).toEqual('mock');
    expect(ngMocks.stub(mock, 'nameMethod')).toHaveBeenCalledWith('mock');
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
      nameGet: 'fake3',
      nameSet: 'fake5',
    });
    ngMocks.stub(test, 'nameRead', 'get');
    spyOnProperty(test, 'nameRead', 'get').and.returnValue('fake4');

    expect(test).toEqual(jasmine.any(Test));
    expect(test.echo()).toBe('fake1');
    expect(test.nameGet).toBe('fake3');
    expect(test.nameRead).toBe('fake4');
    expect(test.nameSet).toBe('fake5');
  });

  it('respects original class in replaceWithMocks', () => {
    class A {}

    class B {}

    class Test {
      private member = A;

      public getMember() {
        return this.member;
      }
    }

    ngMocksUniverse.cacheMocks.set(A, B);

    const instance = new Test();
    const updated = mockServiceHelper.replaceWithMocks(instance);
    expect(updated).toEqual(jasmine.any(Test));
    expect(updated.getMember()).toBe(B);
  });

  it('keeps setter when we add getter', () => {
    const value = {};
    mockServiceHelper.mock(value, 'prop', 'set');
    mockServiceHelper.mock(value, 'prop', 'get');
    const def = Object.getOwnPropertyDescriptor(value, 'prop') || {};
    expect(def.get).toBeDefined();
    expect(def.set).toBeDefined();
  });

  it('returns undefined on undefined in replaceWithMocks', () => {
    expect(mockServiceHelper.replaceWithMocks(null)).toEqual(null);
  });
});

describe('replaceWithMocks', () => {
  it('removes excluded things from an array', async () => {
    @NgModule({
      providers: [
        {
          provide: 'test',
          useValue: [DeepParentClass, ParentClass, GetterSetterMethodHuetod],
        },
      ],
    })
    class TargetModule {}

    await MockBuilder().mock(TargetModule).keep('test').exclude(ParentClass);
    const actual = TestBed.get('test');
    expect(actual).toEqual([DeepParentClass, GetterSetterMethodHuetod]);
  });

  it('removes excluded things from an object', async () => {
    @NgModule({
      providers: [
        {
          provide: 'test',
          useValue: {
            DeepParentClass,
            GetterSetterMethodHuetod,
            ParentClass,
          },
        },
      ],
    })
    class TargetModule {}

    await MockBuilder().mock(TargetModule).keep('test').exclude(ParentClass);
    const actual = TestBed.get('test');
    expect(actual).toEqual({
      DeepParentClass,
      GetterSetterMethodHuetod,
    });
  });

  it('keeps all guards without excluding NG_GUARDS', async () => {
    @NgModule({
      providers: [
        {
          provide: 'test',
          useValue: {
            canActivate: [DeepParentClass, GetterSetterMethodHuetod, ParentClass],
          },
        },
      ],
    })
    class TargetModule {}

    await MockBuilder().mock(TargetModule).keep('test');
    const actual = TestBed.get('test');
    expect(actual).toEqual({
      canActivate: [DeepParentClass, GetterSetterMethodHuetod, ParentClass],
    });
  });

  it('ignores all guards with excluded NG_GUARDS', async () => {
    @NgModule({
      providers: [
        {
          provide: 'test',
          useValue: {
            canActivate: [DeepParentClass, GetterSetterMethodHuetod, ParentClass],
          },
        },
      ],
    })
    class TargetModule {}

    await MockBuilder().mock(TargetModule).keep('test').exclude(NG_GUARDS);
    const actual = TestBed.get('test');
    expect(actual).toEqual({
      canActivate: [],
    });
  });
});

describe('resolveProvider', () => {
  it('ignores useFactory and useValue interceptors with excluded NG_INTERCEPTORS', async () => {
    @NgModule({
      imports: [HttpClientModule],
      providers: [
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useValue: false,
        },
        {
          multi: true,
          provide: HTTP_INTERCEPTORS,
          useFactory: () => true,
        },
      ],
    })
    class TargetModule {}

    await MockBuilder()
      .mock(TargetModule)
      .replace(HttpClientModule, HttpClientTestingModule)
      .keep(HTTP_INTERCEPTORS)
      .exclude(NG_INTERCEPTORS);
    const actual = TestBed.get(HTTP_INTERCEPTORS);
    expect(actual).not.toEqual(jasmine.arrayContaining([false, true]));
  });
});
