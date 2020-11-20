// tslint:disable no-duplicate-imports

import * as core from '@angular/core';
import { Component, Directive as DirectiveSource, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

// Because of A5 we need to cast Directive to any type
// To let it accept 0 parameters.
function Directive(...args: any[]): any {
  return (DirectiveSource as any)(...args);
}

@Directive()
class BaseClass {
  public name = 'directive';
}

@Injectable()
class MyProvider extends BaseClass {}

@Component({
  providers: [MyProvider],
  selector: 'target',
  template: '{{ service.name }}',
})
class MyComponent {
  public constructor(public readonly service: MyProvider) {}
}

@NgModule({
  declarations: [BaseClass, MyComponent],
  exports: [BaseClass, MyComponent],
})
class ModuleWithComponent {}

describe('double-decorator-ivy:without-selector', () => {
  beforeEach(() => {
    if (!(core as any).ɵivyEnabled) {
      pending('ivy fails differently');
    }
  });

  describe('default', () => {
    beforeEach(() => TestBed.configureTestingModule({ imports: [ModuleWithComponent] }).compileComponents());

    it('fails', () => {
      expect(() => MockRender(MyComponent)).toThrowError(/Directive BaseClass has no selector/);
    });
  });

  describe('hot-fix', () => {
    beforeEach(() => MockBuilder(MyComponent, ModuleWithComponent).exclude(BaseClass).mock(MyProvider));

    it('fixes the issue via exclude', () => {
      const fixture = MockRender(MyComponent);
      expect(fixture.nativeElement.innerHTML).toContain('<target></target>');
    });
  });

  describe('the-issue', () => {
    beforeEach(() => MockBuilder(MyComponent, ModuleWithComponent).mock(MyProvider));

    it('fails', () => {
      expect(() => MockRender(MyComponent)).toThrowError(/Directive MockOfBaseClass has no selector/);
    });
  });

  describe('keep', () => {
    beforeEach(() => MockBuilder(MyComponent, ModuleWithComponent).keep(MyProvider));

    it('fails', () => {
      expect(() => MockRender(MyComponent)).toThrowError(/Directive MockOfBaseClass has no selector/);
    });
  });
});
