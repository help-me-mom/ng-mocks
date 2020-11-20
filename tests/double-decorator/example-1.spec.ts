import { Component, Directive as DirectiveSource, Injectable, NgModule } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';

// Because of A5 we need to cast Directive to any type
// To let it accept 0 parameters.
function Directive(...args: any[]): any {
  return (DirectiveSource as any)(...args);
}

@Directive()
class TargetDirective {
  public name = 'directive';
}

@Injectable()
class TargetProvider extends TargetDirective {
  public name = 'provider';
}

@Component({
  providers: [TargetProvider],
  selector: 'target',
  template: '{{ service.name }}',
})
class TargetComponent {
  public readonly service: TargetProvider;

  public constructor(service: TargetProvider) {
    this.service = service;
  }
}

@NgModule({
  declarations: [TargetComponent],
  exports: [TargetComponent],
})
class TargetModule {}

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
    const myProviderMock = () => ({
      name: 'mock',
    });

    beforeEach(() => MockBuilder(TargetComponent, TargetModule).mock(TargetProvider, myProviderMock()));

    it('provides correct decoration of the directive', () => {
      const fixture = MockRender(TargetComponent);

      expect(fixture.nativeElement.innerHTML).toEqual('<target>mock</target>');
    });
  });
});
