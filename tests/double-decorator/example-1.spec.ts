import {
  Component,
  Directive,
  Injectable,
  NgModule,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { MockBuilder, MockRender } from 'ng-mocks';

@Directive(undefined as any)
class TargetDirective {
  public name = 'directive';
}

@Injectable()
class TargetProvider extends TargetDirective {
  public name = 'provider';
}

@Component({
  providers: [TargetProvider],
  selector: 'target-double-decorator-1',
  template: '{{ service.name }}',
})
class TargetComponent {
  public constructor(public readonly service: TargetProvider) {}
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

const myProviderMock = () => ({
  name: 'mock',
});

describe('double-decorator:example-1', () => {
  describe('real', () => {
    beforeEach(() =>
      TestBed.configureTestingModule({
        imports: [TargetModule],
      }).compileComponents(),
    );

    it('provides correct service', () => {
      const fixture = TestBed.createComponent(TargetComponent);
      fixture.detectChanges();

      expect(fixture.nativeElement.innerHTML).toEqual('provider');
    });
  });

  describe('mock', () => {
    beforeEach(() =>
      MockBuilder(TargetComponent, TargetModule).mock(
        TargetProvider,
        myProviderMock(),
      ),
    );

    it('provides correct decoration of the directive', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toEqual(
        '<target-double-decorator-1>mock</target-double-decorator-1>',
      );
    });
  });
});
