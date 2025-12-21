import {
  Component,
  Directive,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Directive({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
} as never)
class BaseClass {
  public name = 'directive';
}

@Injectable()
class MyProvider extends BaseClass {}

@Component({
  providers: [MyProvider],
  selector: 'target-double-decorator-without-selector-ivy',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]: false,
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
  // Because of junit issue we need to return before beforeEach
  // https://github.com/karma-runner/karma-junit-reporter/issues/186
  if (!(ModuleWithComponent as any).ɵmod) {
    it('ivy fails differently', () => {
      // pending('ivy fails differently');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [ModuleWithComponent],
      }).compileComponents(),
    );

    it('fails', () => {
      try {
        MockRender(MyComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toEqual(
          `Directive ${BaseClass.name} has no selector, please add it!`,
        );
      }
    });
  });

  describe('hot-fix', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent)
        .exclude(BaseClass)
        .mock(MyProvider),
    );

    it('fixes the issue via exclude', () => {
      const fixture = MockRender(MyComponent);
      expect(fixture.nativeElement.innerHTML).toContain(
        '<target-double-decorator-without-selector-ivy></target-double-decorator-without-selector-ivy>',
      );
    });
  });

  describe('the-issue', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent).mock(MyProvider),
    );

    it('fails', () => {
      try {
        MockRender(MyComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toEqual(
          `Directive MockOf${BaseClass.name} has no selector, please add it!`,
        );
      }
    });
  });

  describe('keep', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent).keep(MyProvider),
    );

    it('fails', () => {
      try {
        MockRender(MyComponent);
        fail('an error expected');
      } catch (error) {
        expect((error as Error).message).toEqual(
          `Directive MockOf${BaseClass.name} has no selector, please add it!`,
        );
      }
    });
  });
});
