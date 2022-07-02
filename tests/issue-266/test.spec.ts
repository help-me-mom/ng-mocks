import {
  Component,
  Directive,
  Injectable,
  Input,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';

import { MockBuilder, MockRender, ngMocks } from 'ng-mocks';

@Component({
  template: 'target',
})
class TargetComponent {
  public readonly name = 'component';
}

@Directive({
  selector: '[target],[target1]',
})
class TargetDirective {
  public readonly name = 'directive';
  @Input() public readonly value = '';
}

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  public readonly value = '';

  public transform(value: string): number {
    return this.value.length + value.length;
  }
}

@Injectable()
class TargetService {
  public readonly name = 'target';
  public readonly value: string = '';
}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
  exports: [TargetComponent, TargetDirective, TargetPipe],
  providers: [TargetService],
})
class TargetModule {}

// fix for jest without jasmine assertions
const assertion: any =
  typeof jasmine === 'undefined' ? expect : jasmine;

// @see https://github.com/help-me-mom/ng-mocks/issues/266
describe('issue-266', () => {
  beforeEach(() => MockBuilder(TargetModule));

  it('renders components w/o selectors', () => {
    const fixture = MockRender(TargetComponent);

    expect(fixture.point).toBeDefined();
    expect(fixture.point.componentInstance).toEqual(
      assertion.any(TargetComponent),
    );
    expect(fixture.point.componentInstance.name).toEqual('component');
    expect(fixture.point.nativeElement.innerHTML).toEqual('target');

    expect(ngMocks.find(TargetComponent)).toBe(fixture.point);
    expect(ngMocks.findInstance(TargetComponent)).toBe(
      fixture.point.componentInstance,
    );
  });

  it('renders directives', () => {
    const params = {
      value: '123',
    };
    const fixture = MockRender(TargetDirective, params);

    expect(fixture.point).toBeDefined();
    expect(fixture.point.componentInstance).toEqual(
      assertion.any(TargetDirective),
    );
    expect(fixture.point.componentInstance.name).toEqual('directive');
    expect(fixture.point.componentInstance.value).toEqual('123');

    // DetectChanges does not break the pointer.
    params.value = '321';
    fixture.detectChanges();
    expect(fixture.point.componentInstance).toEqual(
      assertion.any(TargetDirective),
    );
    expect(fixture.point.componentInstance.value).toEqual('321');

    expect(ngMocks.find(TargetDirective)).toBe(fixture.point);
    expect(ngMocks.findInstance(TargetDirective)).toBe(
      fixture.point.componentInstance,
    );
  });

  it('fails on not provided pipes', () => {
    expect(() => MockRender(TargetPipe)).toThrow();
  });

  it('renders services', () => {
    const fixture = MockRender(TargetService);

    expect(fixture.point).toBeDefined();
    expect(fixture.point.componentInstance).toEqual(
      assertion.any(TargetService),
    );
    expect(fixture.point.componentInstance.name).toEqual('target');
    expect(fixture.point.componentInstance.value).toEqual('');
  });

  it('renders services with params', () => {
    const params = {
      value: '123',
    };
    const fixture = MockRender(TargetService, params);

    expect(fixture.point).toBeDefined();
    expect(fixture.point.componentInstance).toEqual(
      assertion.any(TargetService),
    );
    expect(fixture.point.componentInstance.value).toEqual('123');

    fixture.componentInstance.value = '321';
    expect(fixture.point.componentInstance.value).toEqual('321');
  });
});
