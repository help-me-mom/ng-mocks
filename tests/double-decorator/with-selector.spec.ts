import {
  Component,
  Directive,
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

@Directive({
  selector: 'target-double-decorator-with-selector',
})
class BaseDirective {
  public name = 'directive';
}

@Injectable()
class MyProvider extends BaseDirective {}

@Component({
  providers: [MyProvider],
  selector: 'target-double-decorator-with-selector',
  template: '{{ service.name }}',
})
class MyComponent {
  public constructor(public readonly service: MyProvider) {}
}

@NgModule({
  declarations: [BaseDirective, MyComponent],
  exports: [BaseDirective, MyComponent],
})
class ModuleWithComponent {}

const myProviderMock = () => ({
  name: 'mock',
});

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
        '<target-double-decorator-with-selector>directive</target-double-decorator-with-selector>',
      );
    });
  });

  describe('hot-fix', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent)
        .exclude(BaseDirective)
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
        '<target-double-decorator-with-selector>mock</target-double-decorator-with-selector>',
      );
    });
  });

  describe('the-issue', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent).mock(
        MyProvider,
        myProviderMock(),
      ),
    );

    it('provides correct decoration of the directive', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toContain(
        '<target-double-decorator-with-selector>mock</target-double-decorator-with-selector>',
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
        '<target-double-decorator-with-selector>directive</target-double-decorator-with-selector>',
      );
    });
  });
});
