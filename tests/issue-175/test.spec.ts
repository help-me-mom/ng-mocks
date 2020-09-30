// tslint:disable:no-console

import { Component, Directive, Injectable, NgModule, Pipe, PipeTransform } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

@Injectable()
class Target1Service {}

@Injectable()
class Target2Service {}

@Component({
  providers: [Target1Service],
  selector: 'com-1',
  template: 'com-1',
})
class Target1Component {
  public service: Target1Service;

  constructor(service: Target1Service) {
    this.service = service;
  }
}

@Component({
  selector: 'com-2',
  template: 'com-2',
})
class Target2Component {
  public service: Target2Service;

  constructor(service: Target2Service) {
    this.service = service;
  }
}

@Directive({
  providers: [Target1Service],
  selector: 'dir-1',
})
class Target1Directive {
  public service: Target1Service;

  constructor(service: Target1Service) {
    this.service = service;
  }
}

@Directive({
  selector: 'dir-2',
})
class Target2Directive {
  public service: Target2Service;

  constructor(service: Target2Service) {
    this.service = service;
  }
}

@Pipe({
  name: 'pip1',
})
class Target1Pipe implements PipeTransform {
  protected name = 'pip1';

  transform(): string {
    return this.name;
  }
}

@Pipe({
  name: 'pip2',
})
class Target2Pipe implements PipeTransform {
  protected name = 'pip2';

  transform(): string {
    return this.name;
  }
}

@NgModule({
  declarations: [Target1Component, Target1Directive, Target1Pipe],
  exports: [Target1Component, Target1Directive, Target1Pipe],
})
class Target1Module {}

@NgModule({
  declarations: [Target2Component, Target2Directive, Target2Pipe],
  exports: [Target2Component, Target2Directive, Target2Pipe],
  providers: [Target2Service],
})
class Target2Module {}

@NgModule({
  exports: [Target1Module, Target2Module],
  imports: [Target1Module, Target2Module],
})
class TargetModule {}

describe('issue-175', () => {
  // Thanks Ivy, it doesn't throw an error and we have to use injector.
  let backupWarn: typeof console.warn;
  let backupError: typeof console.error;

  beforeAll(() => {
    backupWarn = console.warn;
    backupError = console.error;
    console.error = console.warn = (...args: any[]) => {
      throw new Error(args.join(' '));
    };
  });

  afterAll(() => {
    console.error = backupError;
    console.warn = backupWarn;
  });

  describe('module', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target2Module));

    it('fails', () => {
      expect(() => MockRender(Target2Component)).toThrowError(/'com-2' is not a known element/);
    });
  });

  describe('module:component', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target1Component));

    it('fails', () => {
      expect(() => MockRender(Target1Component)).toThrowError(/'com-1' is not a known element/);
    });
  });

  describe('module:component:service', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target1Service));

    it('fails', () => {
      expect(() => MockRender(Target1Component)).toThrowError(/No provider for Target1Service/);
    });
  });

  describe('module:directive', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target2Directive));

    it('fails', () => {
      expect(() => MockRender(`<dir-2></dir-2>`)).toThrowError(/'dir-2' is not a known element/);
    });
  });

  describe('module:directive:service', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target1Service));

    it('fails', () => {
      expect(() => MockRender(`<dir-1></dir-1>`)).toThrowError(/No provider for Target1Service/);
    });
  });

  describe('module:pipe', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target1Pipe));

    it('fails', () => {
      expect(() => MockRender(`{{ 'test' | pip1 }}`)).toThrowError(/The pipe 'pip1' could not be found/);
    });
  });

  describe('module:service', () => {
    beforeEach(() => MockBuilder(TargetModule).exclude(Target2Service));

    it('fails', () => {
      expect(() => MockRender(Target2Component)).toThrowError(/No provider for Target2Service/);
    });
  });

  describe('component:service', () => {
    beforeEach(() => MockBuilder(Target1Component).exclude(Target1Service));

    it('fails', () => {
      expect(() => MockRender(Target1Component)).toThrowError(/No provider for Target1Service/);
    });
  });

  describe('directive:service', () => {
    beforeEach(() => MockBuilder(Target1Directive).exclude(Target1Service));

    it('fails', () => {
      expect(() => MockRender(`<dir-1></dir-1>`)).toThrowError(/No provider for Target1Service/);
    });
  });

  describe('beforeAll:component via createComponent', () => {
    let ngModule: NgModule;
    beforeAll(() => (ngModule = MockBuilder(Target1Component).exclude(Target1Service).build()));
    beforeEach(() => {
      TestBed.configureTestingModule(ngModule);
    });

    it('fails first time via TestBed.createComponent', () => {
      expect(() => TestBed.createComponent(Target1Component)).toThrowError(/No provider for Target1Service/);
    });

    it('fails second time via TestBed.createComponent', () => {
      expect(() => TestBed.createComponent(Target1Component)).toThrowError(/No provider for Target1Service/);
    });
  });

  describe('beforeAll:component via compileComponents', () => {
    let ngModule: NgModule;

    describe('exclude', () => {
      beforeAll(() => (ngModule = MockBuilder(Target1Component).exclude(Target1Service).build()));
      beforeEach(() => TestBed.configureTestingModule(ngModule).compileComponents());

      it('fails first time via TestBed.createComponent', () => {
        expect(() => TestBed.createComponent(Target1Component)).toThrowError(/No provider for Target1Service/);
      });

      it('fails second time via TestBed.createComponent', () => {
        expect(() => TestBed.createComponent(Target1Component)).toThrowError(/No provider for Target1Service/);
      });
    });

    describe('normal', () => {
      beforeAll(() => (ngModule = MockBuilder(TargetModule).build()));
      beforeEach(() => TestBed.configureTestingModule(ngModule).compileComponents());

      it('should not fail anymore via TestBed.createComponent', () => {
        expect(() => TestBed.createComponent(Target1Component)).not.toThrowError(/No provider for Target1Service/);
      });
    });
  });

  describe('beforeAll:directive', () => {
    let ngModule: NgModule;
    beforeAll(() => (ngModule = MockBuilder(Target1Directive).exclude(Target1Service).build()));
    beforeEach(() => TestBed.configureTestingModule(ngModule).compileComponents());

    it('fails first time via MockRender', () => {
      expect(() => MockRender(`<dir-1></dir-1>`)).toThrowError(/No provider for Target1Service/);
    });

    it('fails second time via MockRender', () => {
      expect(() => MockRender(`<dir-1></dir-1>`)).toThrowError(/No provider for Target1Service/);
    });
  });
});
