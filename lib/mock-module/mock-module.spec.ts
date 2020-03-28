/* tslint:disable:max-classes-per-file */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { BrowserModule, By } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MockComponent, MockModule, MockRender } from 'ng-mocks';

import {
  AppRoutingModule,
  CustomWithServiceComponent,
  ExampleComponent,
  ExampleConsumerComponent,
  LogicNestedModule,
  LogicRootModule,
  ModuleWithProvidersModule,
  ParentModule,
  SameImports1Module,
  SameImports2Module,
  WithServiceModule
} from './test-fixtures';

@Component({
  selector: 'component-subject',
  template: `
    <example-component></example-component>
    <span example-directive></span>
    {{ test | examplePipe }}
  `
})
class ComponentSubject {
  test = 'test';
}

@Component({
  selector: 'same-imports',
  template: `same imports`
})
class SameImportsComponent {}

describe('MockModule', () => {
  let fixture: ComponentFixture<ComponentSubject>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ComponentSubject],
      imports: [MockModule(ParentModule), MockModule(ModuleWithProvidersModule)]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ComponentSubject);
        fixture.detectChanges();
      });
  }));

  it('should do stuff', () => {
    const mockedComponent = fixture.debugElement.query(By.directive(MockComponent(ExampleComponent)))
      .componentInstance as ExampleComponent;
    expect(mockedComponent).not.toBeNull();
  });
});

describe('SameImportsModules', () => {
  let fixture: ComponentFixture<SameImportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SameImportsComponent],
      imports: [MockModule(SameImports1Module), MockModule(SameImports2Module)]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(SameImportsComponent);
        fixture.detectChanges();
      });
  }));

  it('should be imported correctly', () => {
    expect(fixture.componentInstance).toEqual(jasmine.any(SameImportsComponent));
    expect(fixture.nativeElement.innerText).toEqual('same imports');
  });
});

describe('NeverMockModules', () => {
  let fixture: ComponentFixture<SameImportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SameImportsComponent],
      imports: [MockModule(CommonModule), MockModule(BrowserModule), MockModule(BrowserAnimationsModule)]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(SameImportsComponent);
        fixture.detectChanges();
      });
  }));

  it('should not fail when we pass them to MockModule', () => {
    expect(fixture.componentInstance).toEqual(jasmine.any(SameImportsComponent));
    expect(fixture.nativeElement.innerText).toEqual('same imports');
  });
});

describe('RouterModule', () => {
  let fixture: ComponentFixture<ExampleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ExampleComponent],
      imports: [MockModule(AppRoutingModule)]
    })
      .compileComponents()
      .then(() => {
        fixture = TestBed.createComponent(ExampleComponent);
        fixture.detectChanges();
      });
  }));

  it('should not fail when we pass RouterModule to MockModule', () => {
    expect(fixture.componentInstance).toEqual(jasmine.any(ExampleComponent));
    expect(fixture.nativeElement.innerText).toEqual('My Example');
  });
});

// What we mock should always export own private imports and declarations to allow us to use it in TestBed.
// In this test we check that nested module from cache still provides own private things.
// See https://github.com/ike18t/ng-mocks/pull/35
describe('Usage of cached nested module', () => {
  let fixture: ComponentFixture<ExampleConsumerComponent>;

  describe('1st test for root', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ExampleConsumerComponent],
        imports: [MockModule(LogicRootModule)]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(ExampleConsumerComponent);
          fixture.detectChanges();
        });
    }));

    it('should be able to find component', () => {
      expect(fixture.componentInstance).toEqual(jasmine.any(ExampleConsumerComponent));
    });
  });

  describe('2nd test for nested', () => {
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ExampleConsumerComponent],
        imports: [MockModule(LogicNestedModule)]
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(ExampleConsumerComponent);
          fixture.detectChanges();
        });
    }));

    it('should be able to find component', () => {
      expect(fixture.componentInstance).toEqual(jasmine.any(ExampleConsumerComponent));
    });
  });
});

describe('WithServiceModule', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CustomWithServiceComponent],
      imports: [MockModule(WithServiceModule)]
    });
  }));

  it('should not throw an error of service method', () => {
    const fixture = MockRender('<custom-service></custom-service>');
    expect(fixture).toBeDefined();
  });
});

// TODO> Doesn't work because ParentModule doesn't export anything.
// TODO> Basically it's feature of ng-mocks to export declarations of mocked modules.
// describe('RealModule', () => {
//   let fixture: ComponentFixture<ComponentSubject>;
//
//   beforeEach(async(() => {
//     TestBed.configureTestingModule({
//       declarations: [
//         ComponentSubject
//       ],
//       imports: [
//         ParentModule,
//       ],
//     })
//     .compileComponents()
//     .then(() => {
//       fixture = TestBed.createComponent(ComponentSubject);
//       fixture.detectChanges();
//     });
//   }));
//
//   it('should do stuff', () => {
//     expect(fixture.nativeElement.innerHTML)
//       .toContain('<example-component><span>My Example</span></example-component>');
//     expect(fixture.nativeElement.innerHTML)
//       .toContain('<span example-directive="">ExampleDirective</span>');
//     expect(fixture.nativeElement.innerHTML)
//       .toContain('Example: test');
//   });
// });
