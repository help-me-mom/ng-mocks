// tslint:disable no-duplicate-imports

import {
  Component,
  Directive as DirectiveSource,
  Injectable,
  NgModule,
} from '@angular/core';
import * as core from '@angular/core';
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

describe('double-decorator:without-selector', () => {
  // Because of junit issue we need to return before beforeEach
  // https://github.com/karma-runner/karma-junit-reporter/issues/186
  if ((core as any).ɵivyEnabled) {
    it('ivy', () => {
      pending('fails differently');
    });

    return;
  }

  beforeEach(() => {
    if ((core as any).ɵivyEnabled) {
      pending('ivy fails differently');
    }
  });

  describe('default', () => {
    it('fails', async () => {
      try {
        await TestBed.configureTestingModule({
          imports: [ModuleWithComponent],
        }).compileComponents();
        fail('should fail');
      } catch (error) {
        expect(error.message).toMatch(
          /Directive BaseClass has no selector/,
        );
      }
    });
  });

  // The only solution.
  describe('hot-fix', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent)
        .exclude(BaseClass)
        .mock(MyProvider),
    );

    it('fixes the issue via exclude', () => {
      const fixture = MockRender(MyComponent);
      expect(fixture.nativeElement.innerHTML).toContain(
        '<target></target>',
      );
    });
  });

  describe('the-issue', () => {
    it('fails', async () => {
      try {
        await MockBuilder(MyComponent, ModuleWithComponent).mock(
          MyProvider,
        );
        fail('should fail');
      } catch (error) {
        expect(error.message).toMatch(
          /Directive MockOfBaseClass has no selector/,
        );
      }
    });
  });

  describe('keep', () => {
    it('fails', async () => {
      try {
        await MockBuilder(MyComponent, ModuleWithComponent).keep(
          MyProvider,
        );
        fail('should fail');
      } catch (error) {
        expect(error.message).toMatch(
          /Directive MockOfBaseClass has no selector/,
        );
      }
    });
  });
});
