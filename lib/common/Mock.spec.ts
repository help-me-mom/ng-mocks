/* tslint:disable: max-classes-per-file */

import { Component, Directive, NgModule, Pipe, PipeTransform } from '@angular/core';

import { MockComponent } from '../mock-component';
import { MockDirective } from '../mock-directive';
import { MockModule } from '../mock-module';
import { MockPipe } from '../mock-pipe';

import { Mock, MockControlValueAccessor } from './Mock';

class ParentClass {
  protected parentValue = true;

  public parentMethod(): boolean {
    return this.parentValue;
  }
}

@NgModule({})
@Component({
  template: '',
})
@Directive({
  selector: 'mock',
})
@Pipe({
  name: 'mock',
})
class ChildClass extends ParentClass implements PipeTransform {
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
    const instance = new (MockModule(ChildClass))();
    expect(instance).toEqual(jasmine.any(Mock));
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockComponent', () => {
    const instance = new (MockComponent(ChildClass))();
    expect(instance).toEqual(jasmine.any(MockControlValueAccessor));
    expect(instance).toEqual(jasmine.any(Mock));
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockDirective', () => {
    const instance = new (MockDirective(ChildClass))();
    expect(instance).toEqual(jasmine.any(MockControlValueAccessor));
    expect(instance).toEqual(jasmine.any(Mock));
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });

  it('should affect as MockPipe', () => {
    const instance = new (MockPipe(ChildClass))();
    expect(instance).toEqual(jasmine.any(Mock));
    expect(instance.parentMethod()).toBeUndefined('mocked to an empty function');
    expect(instance.childMethod()).toBeUndefined('mocked to an empty function');
  });
});
