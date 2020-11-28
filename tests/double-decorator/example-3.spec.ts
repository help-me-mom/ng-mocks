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

@Directive()
@Injectable()
class BaseClass {
  public name = 'directive';
}

@Component({
  providers: [BaseClass],
  selector: 'target',
  template: '{{ service.name }}',
})
class MyComponent {
  public constructor(public readonly service: BaseClass) {}
}

@NgModule({
  declarations: [MyComponent],
})
class ModuleWithComponent {}

describe('double-decorator:example-3', () => {
  describe('default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({ declarations: [MyComponent] }),
    );

    it('does not fail', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>directive</target>',
      );
    });
  });

  // MockInstance should customize BaseClass with double decoration.
  describe('hot-fix', () => {
    const myProviderMock = () => ({
      name: 'mock',
    });

    beforeAll(() =>
      MockInstance(BaseClass, instance =>
        ngMocks.stub(instance, myProviderMock()),
      ),
    );
    afterAll(MockReset);

    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent).mock(BaseClass),
    );

    it('does not fail', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>mock</target>',
      );
    });
  });

  // .mock should customize BaseClass with double decoration.
  describe('the-issue', () => {
    const myProviderMock = () => ({
      name: 'mock',
    });

    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent).mock(
        BaseClass,
        myProviderMock(),
      ),
    );

    it('does not fail', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target>mock</target>',
      );
    });
  });
});
