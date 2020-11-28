import {
  Component,
  Directive as DirectiveSource,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import {
  MockBuilder,
  MockInstance,
  MockRender,
  MockReset,
  ngMocks,
} from 'ng-mocks';

// Because of A5 we need to cast Directive to any type
// To let it accept 0 parameters.
function Directive(...args: any[]): any {
  return (DirectiveSource as any)(...args);
}

@Directive({
  selector: 'target',
})
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

describe('double-decorator:with-selector', () => {
  describe('default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [ModuleWithComponent],
      }).compileComponents(),
    );

    it('does not fail', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        '<target>directive</target>',
      );
    });
  });

  describe('hot-fix', () => {
    const myProviderMock = () => ({
      name: 'mock',
    });

    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent)
        .exclude(BaseClass)
        .mock(MyProvider),
    );

    beforeAll(() =>
      MockInstance(MyProvider, instance =>
        ngMocks.stub(instance, myProviderMock()),
      ),
    );

    afterAll(MockReset);

    it('provides correct decoration of the directive', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        '<target>mock</target>',
      );
    });
  });

  describe('the-issue', () => {
    const myProviderMock = () => ({
      name: 'mock',
    });

    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent).mock(
        MyProvider,
        myProviderMock(),
      ),
    );

    it('provides correct decoration of the directive', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        '<target>mock</target>',
      );
    });
  });

  describe('keep', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent).keep(MyProvider),
    );

    it('provides correct decoration of the directive', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        '<target>directive</target>',
      );
    });
  });
});
