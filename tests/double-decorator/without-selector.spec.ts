import {
  Component,
  Directive,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Directive({
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
} as never)
class BaseClass {
  public name = 'directive';
}

@Injectable()
class MyProvider extends BaseClass {}

@Component({
  providers: [MyProvider],
  selector: 'target-double-decorator-without-selector',
  ['standalone' as never /* TODO: remove after upgrade to a14 */]:
    false,
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
  if ((ModuleWithComponent as any).ɵmod) {
    it('ivy fails differently', () => {
      // pending('ivy fails differently');
      expect(true).toBeTruthy();
    });

    return;
  }

  describe('default', () => {
    it('fails', async () => {
      try {
        await TestBed.configureTestingModule({
          imports: [ModuleWithComponent],
        }).compileComponents();
        fail('an error expected');
      } catch (error) {
        if (error instanceof Error) {
          expect((error as Error).message).toContain(
            `Directive ${BaseClass.name} has no selector`,
          );
        } else {
          fail('an error expected');
        }
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
        '<target-double-decorator-without-selector></target-double-decorator-without-selector>',
      );
    });
  });

  describe('the-issue', () => {
    it('fails', async () => {
      try {
        await MockBuilder(MyComponent, ModuleWithComponent).mock(
          MyProvider,
        );
        fail('an error expected');
      } catch (error) {
        if (error instanceof Error) {
          expect((error as Error).message).toContain(
            `Directive MockOf${BaseClass.name} has no selector`,
          );
        } else {
          fail('an error expected');
        }
      }
    });
  });

  describe('keep', () => {
    it('fails', async () => {
      try {
        await MockBuilder(MyComponent, ModuleWithComponent).keep(
          MyProvider,
        );
        fail('an error expected');
      } catch (error) {
        if (error instanceof Error) {
          expect((error as Error).message).toContain(
            `Directive MockOf${BaseClass.name} has no selector`,
          );
        } else {
          fail('an error expected');
        }
      }
    });
  });
});
