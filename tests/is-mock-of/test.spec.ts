import {
  Component,
  Directive,
  NgModule,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {
  isMockOf,
  MockComponent,
  MockDirective,
  MockModule,
  MockPipe,
} from 'ng-mocks';

@Pipe({
  name: 'target',
})
class TargetPipe implements PipeTransform {
  protected name = 'pipe:';

  public transform(value: string): any {
    return `${this.name}${value}`;
  }
}

@Component({
  selector: 'target',
  template: 'target',
})
class TargetComponent {}

@Directive({
  selector: 'target',
})
class TargetDirective {}

@NgModule({
  declarations: [TargetComponent, TargetDirective, TargetPipe],
})
class TargetModule {}

describe('isMockOf', () => {
  it('detects module', () => {
    const mock = MockModule(TargetModule);
    expect(isMockOf(new mock(), TargetModule, 'm')).toBeTruthy();
    expect(
      isMockOf(new TargetModule(), TargetModule, 'm'),
    ).toBeFalsy();
  });

  it('detects pipe', () => {
    const mock = MockPipe(TargetPipe);
    expect(isMockOf(new mock(), TargetPipe, 'p')).toBeTruthy();
    expect(isMockOf(new TargetPipe(), TargetPipe, 'p')).toBeFalsy();
  });

  it('detects directive', () => {
    const mock = MockDirective(TargetDirective);
    expect(isMockOf(new mock(), TargetDirective, 'd')).toBeTruthy();
    expect(
      isMockOf(new TargetDirective(), TargetDirective, 'd'),
    ).toBeFalsy();
  });

  it('detects components', () => {
    const mock = MockComponent(TargetComponent);
    expect(isMockOf(new mock(), TargetComponent, 'c')).toBeTruthy();
    expect(
      isMockOf(new TargetComponent(), TargetComponent, 'c'),
    ).toBeFalsy();
  });

  it('detects mocks', () => {
    const mock = MockComponent(TargetComponent);
    expect(isMockOf(new mock(), TargetComponent)).toBeTruthy();
    expect(
      isMockOf(new TargetComponent(), TargetComponent),
    ).toBeFalsy();
  });
});
