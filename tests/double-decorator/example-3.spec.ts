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

@Directive(undefined as any)
@Injectable()
class BaseClass {
  public name = 'directive';
}

@Component({
  providers: [BaseClass],
  selector: 'target-double-decorator-3',
  template: '{{ service.name }}',
})
class MyComponent {
  public constructor(public readonly service: BaseClass) {}
}

@NgModule({
  declarations: [MyComponent],
})
class ModuleWithComponent {}

const myProviderMock = () => ({
  name: 'mock',
});

describe('double-decorator:example-3', () => {
  describe('default', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({ declarations: [MyComponent] }),
    );

    it('does not fail', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-double-decorator-3>directive</target-double-decorator-3>',
      );
    });
  });

  // MockInstance should customize BaseClass with double decoration.
  describe('hot-fix', () => {
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
        '<target-double-decorator-3>mock</target-double-decorator-3>',
      );
    });
  });

  // .mock should customize BaseClass with double decoration.
  describe('the-issue', () => {
    beforeEach(() =>
      MockBuilder(MyComponent, ModuleWithComponent).mock(
        BaseClass,
        myProviderMock(),
      ),
    );

    it('does not fail', () => {
      const fixture = MockRender(MyComponent);

      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-double-decorator-3>mock</target-double-decorator-3>',
      );
    });
  });
});
