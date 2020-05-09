/* tslint:disable: max-classes-per-file */

import { Component, Directive, NgModule, Pipe, PipeTransform } from '@angular/core';
import { Mock, MockComponent, MockControlValueAccessor, MockDirective, MockModule, MockPipe } from 'ng-mocks';

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
    expect(instance).toEqual(jasmine.any(Mock));
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockComponent', () => {
    const instance = new (MockComponent(ChildComponentClass))();
    expect(instance).toEqual(jasmine.any(MockControlValueAccessor));
    expect(instance).toEqual(jasmine.any(Mock));
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockDirective', () => {
    const instance = new (MockDirective(ChildDirectiveClass))();
    expect(instance).toEqual(jasmine.any(MockControlValueAccessor));
    expect(instance).toEqual(jasmine.any(Mock));
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockPipe', () => {
    const instance = new (MockPipe(ChildPipeClass))();
    expect(instance).toEqual(jasmine.any(Mock));
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });
});
